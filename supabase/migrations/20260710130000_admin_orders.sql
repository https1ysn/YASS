-- ============================================================================
-- Yasso Store — orders management (admin)
-- Extends the order status lifecycle and adds the SECURITY DEFINER functions
-- the admin uses to list, inspect and progress orders while the customers /
-- orders / order_items tables stay deny-by-default under RLS.
--
-- Lifecycle: pending → paid → processing → shipped → delivered, with
-- cancellation possible at any non-terminal step. Statuses only move forward.
--
-- NOTE: until admin authentication ships in a later phase, these functions are
-- callable with the public key — restrict the grants once auth exists.
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

-- ------------------------------------------------------ status lifecycle
-- The initial schema allowed ('pending','confirmed','shipped','delivered',
-- 'cancelled'); the admin flow replaces 'confirmed' with 'paid'/'processing'.
alter table public.orders drop constraint if exists orders_status_check;

update public.orders set status = 'processing' where status = 'confirmed';

alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'));

-- --------------------------------------------------------------- admin_orders()
-- Paged, filterable order list for /admin/orders. Searches order number,
-- customer name and phone; filters by status; sorts by date or total.
create or replace function public.admin_orders(
  p_q      text    default null,
  p_status text    default null,
  p_sort   text    default 'newest',
  p_limit  integer default 8,
  p_offset integer default 0
) returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_q      text := nullif(trim(coalesce(p_q, '')), '');
  v_like   text := '%' || v_q || '%';
  v_limit  int  := least(greatest(coalesce(p_limit, 8), 1), 50);
  v_offset int  := greatest(coalesce(p_offset, 0), 0);
  v_total  int;
  v_orders jsonb;
begin
  if p_status is not null
     and p_status not in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Invalid status filter.';
  end if;
  if p_sort not in ('newest', 'oldest', 'total-desc', 'total-asc') then
    raise exception 'Invalid sort.';
  end if;

  select count(*) into v_total
  from orders o
  left join customers c on c.id = o.customer_id
  where (p_status is null or o.status = p_status)
    and (
      v_q is null
      or o.order_number ilike v_like
      or c.full_name ilike v_like
      or c.phone ilike v_like
    );

  select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) into v_orders
  from (
    select
      o.id,
      o.order_number,
      coalesce(c.full_name, '—')             as customer_name,
      coalesce(c.phone, '—')                 as phone,
      o.shipping_city,
      o.total,
      o.payment_method,
      o.status,
      o.created_at,
      (select count(*)::int from order_items oi where oi.order_id = o.id) as item_count
    from orders o
    left join customers c on c.id = o.customer_id
    where (p_status is null or o.status = p_status)
      and (
        v_q is null
        or o.order_number ilike v_like
        or c.full_name ilike v_like
        or c.phone ilike v_like
      )
    order by
      case when p_sort = 'oldest'     then o.created_at end asc,
      case when p_sort = 'total-desc' then o.total      end desc,
      case when p_sort = 'total-asc'  then o.total      end asc,
      o.created_at desc
    limit v_limit offset v_offset
  ) r;

  return jsonb_build_object('total', v_total, 'orders', v_orders);
end;
$$;

-- ------------------------------------------------------- admin_order_details()
-- One order in full: customer, shipping, totals, notes and every line item
-- (with the product's primary image when the product still exists).
create or replace function public.admin_order_details(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id',               o.id,
    'order_number',     o.order_number,
    'status',           o.status,
    'payment_method',   o.payment_method,
    'shipping_method',  o.shipping_method,
    'shipping_country', o.shipping_country,
    'shipping_city',    o.shipping_city,
    'shipping_street',  o.shipping_street,
    'shipping_postal',  o.shipping_postal,
    'subtotal',         o.subtotal,
    'discount',         o.discount,
    'shipping_cost',    o.shipping_cost,
    'total',            o.total,
    'notes',            o.notes,
    'created_at',       o.created_at,
    'customer', jsonb_build_object(
      'name',  coalesce(c.full_name, '—'),
      'phone', coalesce(c.phone, '—'),
      'email', c.email
    ),
    'items', coalesce((
      select jsonb_agg(row_to_json(it))
      from (
        select
          oi.id,
          oi.product_name,
          oi.size,
          oi.color,
          oi.unit_price,
          oi.quantity,
          p.slug,
          (
            select pi.url from product_images pi
            where pi.product_id = p.id
            order by pi.sort_order
            limit 1
          ) as image_url
        from order_items oi
        left join products p on p.id = oi.product_id
        where oi.order_id = o.id
        order by oi.created_at, oi.id
      ) it
    ), '[]'::jsonb)
  )
  from orders o
  left join customers c on c.id = o.customer_id
  where o.id = p_id;
$$;

-- -------------------------------------------------- admin_update_order_status()
-- Progresses an order along the lifecycle. Statuses only move forward;
-- cancellation is allowed from any non-terminal status; delivered and
-- cancelled are terminal.
create or replace function public.admin_update_order_status(
  p_id     uuid,
  p_status text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_flow    text[] := array['pending', 'paid', 'processing', 'shipped', 'delivered'];
  v_current text;
begin
  if p_status is null
     or p_status not in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Invalid status.';
  end if;

  select status into v_current from orders where id = p_id for update;
  if v_current is null then
    raise exception 'Order not found.';
  end if;

  if v_current = p_status then
    return jsonb_build_object('id', p_id, 'status', v_current);
  end if;
  if v_current in ('delivered', 'cancelled') then
    raise exception 'This order is % and can no longer be updated.', v_current;
  end if;
  if p_status <> 'cancelled'
     and coalesce(array_position(v_flow, p_status), 0)
         <= coalesce(array_position(v_flow, v_current), 0) then
    raise exception 'The status can only move forward.';
  end if;

  update orders set status = p_status where id = p_id;

  return jsonb_build_object('id', p_id, 'status', p_status);
end;
$$;

-- ------------------------------------------------------------------- grants
revoke all on function public.admin_orders(text, text, text, integer, integer) from public;
grant execute on function public.admin_orders(text, text, text, integer, integer)
  to anon, authenticated;

revoke all on function public.admin_order_details(uuid) from public;
grant execute on function public.admin_order_details(uuid) to anon, authenticated;

revoke all on function public.admin_update_order_status(uuid, text) from public;
grant execute on function public.admin_update_order_status(uuid, text) to anon, authenticated;

-- Make PostgREST pick up the new functions immediately.
notify pgrst, 'reload schema';
