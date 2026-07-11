-- ============================================================================
-- Yasso Store — place_order()
-- Atomic checkout: find-or-create the customer by phone, generate a unique
-- order number, insert the order and its items — all in one transaction.
--
-- SECURITY DEFINER so the anonymous storefront can place orders while the
-- customers / orders / order_items tables stay deny-by-default under RLS.
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

create sequence if not exists public.order_number_seq start 10001;

create or replace function public.place_order(
  p_full_name       text,
  p_phone           text,
  p_email           text    default null,
  p_country         text    default 'Morocco',
  p_city            text    default null,
  p_street          text    default null,
  p_postal          text    default null,
  p_shipping_method text    default 'standard',
  p_payment_method  text    default 'cod',
  p_subtotal        numeric default 0,
  p_discount        numeric default 0,
  p_shipping_cost   numeric default 0,
  p_total           numeric default 0,
  p_notes           text    default null,
  p_items           jsonb   default '[]'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id  uuid;
  v_order_id     uuid;
  v_order_number text;
begin
  -- ------------------------------------------------------------- validation
  if coalesce(length(trim(p_full_name)), 0) < 2 then
    raise exception 'A valid full name is required.';
  end if;
  if coalesce(length(trim(p_phone)), 0) < 6 then
    raise exception 'A valid phone number is required.';
  end if;
  if coalesce(length(trim(p_city)), 0) < 2 then
    raise exception 'A valid city is required.';
  end if;
  if coalesce(length(trim(p_street)), 0) < 4 then
    raise exception 'A valid street address is required.';
  end if;
  if p_shipping_method not in ('standard', 'express') then
    raise exception 'Invalid shipping method.';
  end if;
  if p_payment_method <> 'cod' then
    raise exception 'Only cash on delivery is available for now.';
  end if;
  if coalesce(jsonb_array_length(p_items), 0) = 0 then
    raise exception 'Your bag is empty.';
  end if;
  if p_total < 0 or p_subtotal < 0 then
    raise exception 'Invalid order totals.';
  end if;

  -- ----------------------------------------- find or create customer (phone)
  select id into v_customer_id
  from public.customers
  where phone = trim(p_phone)
  limit 1;

  if v_customer_id is null then
    insert into public.customers (full_name, phone, email)
    values (trim(p_full_name), trim(p_phone), nullif(trim(coalesce(p_email, '')), ''))
    returning id into v_customer_id;
  else
    update public.customers
    set full_name = trim(p_full_name),
        email     = coalesce(nullif(trim(coalesce(p_email, '')), ''), email)
    where id = v_customer_id;
  end if;

  -- -------------------------------------------------------------- the order
  v_order_number :=
    'YS-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 5, '0');

  insert into public.orders (
    order_number, customer_id, status,
    shipping_country, shipping_city, shipping_street, shipping_postal,
    shipping_method, payment_method,
    subtotal, discount, shipping_cost, total, notes
  ) values (
    v_order_number, v_customer_id, 'pending',
    coalesce(nullif(trim(coalesce(p_country, '')), ''), 'Morocco'),
    trim(p_city), trim(p_street), nullif(trim(coalesce(p_postal, '')), ''),
    p_shipping_method, p_payment_method,
    p_subtotal, p_discount, p_shipping_cost, p_total,
    nullif(trim(coalesce(p_notes, '')), '')
  ) returning id into v_order_id;

  -- -------------------------------------------------------------- the items
  insert into public.order_items
    (order_id, product_id, product_name, size, color, unit_price, quantity)
  select
    v_order_id,
    p.id,
    item->>'name',
    item->>'size',
    item->>'color',
    (item->>'unit_price')::numeric,
    (item->>'quantity')::int
  from jsonb_array_elements(p_items) as item
  left join public.products p on p.slug = item->>'slug';

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number);
end;
$$;

revoke all on function public.place_order(
  text, text, text, text, text, text, text, text, text,
  numeric, numeric, numeric, numeric, text, jsonb
) from public;

grant execute on function public.place_order(
  text, text, text, text, text, text, text, text, text,
  numeric, numeric, numeric, numeric, text, jsonb
) to anon, authenticated;

-- Make PostgREST pick up the new function immediately.
notify pgrst, 'reload schema';
