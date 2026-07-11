-- ============================================================================
-- Yasso Store — customers management (admin)
-- SECURITY DEFINER functions the admin uses to list and inspect customers
-- while the customers / orders tables stay deny-by-default under RLS.
--
-- "Total spent" excludes cancelled orders, matching the dashboard's revenue.
-- The customer's city/address comes from their most recent order.
--
-- NOTE: until admin authentication ships in a later phase, these functions are
-- callable with the public key — restrict the grants once auth exists.
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

-- ------------------------------------------------------------ admin_customers()
-- Paged, searchable customer list for /admin/customers with order aggregates.
create or replace function public.admin_customers(
  p_q      text    default null,
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
  v_q         text := nullif(trim(coalesce(p_q, '')), '');
  v_like      text := '%' || v_q || '%';
  v_limit     int  := least(greatest(coalesce(p_limit, 8), 1), 50);
  v_offset    int  := greatest(coalesce(p_offset, 0), 0);
  v_total     int;
  v_customers jsonb;
begin
  if p_sort not in ('newest', 'oldest', 'orders-desc', 'spent-desc', 'name') then
    raise exception 'Invalid sort.';
  end if;

  select count(*) into v_total
  from customers c
  where (
    v_q is null
    or c.full_name ilike v_like
    or c.phone ilike v_like
    or c.email ilike v_like
  );

  select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) into v_customers
  from (
    select
      c.id,
      c.full_name,
      c.phone,
      c.email,
      c.created_at,
      agg.total_orders,
      agg.total_spent,
      agg.last_order_at,
      agg.last_city
    from customers c
    left join lateral (
      select
        count(*)::int                                              as total_orders,
        coalesce(sum(o.total) filter (where o.status <> 'cancelled'), 0) as total_spent,
        max(o.created_at)                                          as last_order_at,
        (
          select o2.shipping_city from orders o2
          where o2.customer_id = c.id
          order by o2.created_at desc
          limit 1
        )                                                          as last_city
      from orders o
      where o.customer_id = c.id
    ) agg on true
    where (
      v_q is null
      or c.full_name ilike v_like
      or c.phone ilike v_like
      or c.email ilike v_like
    )
    order by
      case when p_sort = 'oldest'      then c.created_at end asc,
      case when p_sort = 'orders-desc' then agg.total_orders end desc,
      case when p_sort = 'spent-desc'  then agg.total_spent end desc,
      case when p_sort = 'name'        then lower(c.full_name) end asc,
      c.created_at desc
    limit v_limit offset v_offset
  ) r;

  return jsonb_build_object('total', v_total, 'customers', v_customers);
end;
$$;

-- ----------------------------------------------------- admin_customer_details()
-- One customer in full: contact details, the address from their most recent
-- order, lifetime statistics and their complete order history.
create or replace function public.admin_customer_details(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id',         c.id,
    'full_name',  c.full_name,
    'phone',      c.phone,
    'email',      c.email,
    'created_at', c.created_at,
    'address', (
      select jsonb_build_object(
        'street',  o.shipping_street,
        'city',    o.shipping_city,
        'postal',  o.shipping_postal,
        'country', o.shipping_country
      )
      from orders o
      where o.customer_id = c.id
      order by o.created_at desc
      limit 1
    ),
    'stats', (
      select jsonb_build_object(
        'total_orders',   count(*)::int,
        'paid_orders',    (count(*) filter (where o.status <> 'cancelled'))::int,
        'total_spent',    coalesce(sum(o.total) filter (where o.status <> 'cancelled'), 0),
        'first_order_at', min(o.created_at),
        'last_order_at',  max(o.created_at)
      )
      from orders o
      where o.customer_id = c.id
    ),
    'orders', coalesce((
      select jsonb_agg(row_to_json(h))
      from (
        select
          o.id,
          o.order_number,
          o.status,
          o.total,
          o.created_at,
          (select count(*)::int from order_items oi where oi.order_id = o.id) as item_count
        from orders o
        where o.customer_id = c.id
        order by o.created_at desc
      ) h
    ), '[]'::jsonb)
  )
  from customers c
  where c.id = p_id;
$$;

-- ------------------------------------------------------------------- grants
revoke all on function public.admin_customers(text, text, integer, integer) from public;
grant execute on function public.admin_customers(text, text, integer, integer)
  to anon, authenticated;

revoke all on function public.admin_customer_details(uuid) from public;
grant execute on function public.admin_customer_details(uuid) to anon, authenticated;

-- Make PostgREST pick up the new functions immediately.
notify pgrst, 'reload schema';
