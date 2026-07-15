-- ============================================================================
-- Yasso Store — admin auth hardening
-- Admin authentication now exists, so this migration delivers on the
-- "restrict once auth ships" note carried by every admin migration:
--
--   1. `is_admin()` — checks the JWT email against the admin allow-list.
--      KEEP THE LIST IN SYNC with src/lib/auth/admins.ts.
--   2. Every admin_* function is re-created with an is_admin() guard and its
--      grant moves from `anon, authenticated` to `authenticated` only.
--   3. The products-bucket write policies become admin-only.
--
-- The storefront is untouched: catalog reads and place_order() stay public.
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

-- -------------------------------------------------------------- is_admin()
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'elbiadyassin25@gmail.com',
      'elbiadyassin26@gmail.com'
    ),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ================================================================ dashboard

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  return (
    select jsonb_build_object(
      'total_products',   (select count(*) from products),
      'total_categories', (select count(*) from categories),
      'total_customers',  (select count(*) from customers),
      'total_orders',     (select count(*) from orders),
      'total_revenue',    coalesce((select sum(total) from orders where status <> 'cancelled'), 0),

      'recent_orders', coalesce((
        select jsonb_agg(row_to_json(recent))
        from (
          select
            o.order_number,
            coalesce(c.full_name, '—')           as customer_name,
            o.shipping_city,
            o.shipping_method,
            o.status,
            o.total,
            o.created_at,
            (select count(*)::int from order_items oi where oi.order_id = o.id) as item_count
          from orders o
          left join customers c on c.id = o.customer_id
          order by o.created_at desc
          limit 5
        ) recent
      ), '[]'::jsonb),

      'best_sellers', coalesce((
        select jsonb_agg(row_to_json(best))
        from (
          select
            oi.product_name,
            p.slug,
            (
              select pi.url from product_images pi
              where pi.product_id = p.id
              order by pi.sort_order
              limit 1
            )                                     as image_url,
            sum(oi.quantity)::int                 as units_sold,
            sum(oi.quantity * oi.unit_price)      as revenue
          from order_items oi
          left join products p on p.id = oi.product_id
          group by oi.product_name, p.slug, p.id
          order by units_sold desc, revenue desc
          limit 5
        ) best
      ), '[]'::jsonb)
    )
  );
end;
$$;

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- ================================================================= products

create or replace function public.admin_save_product(
  p_id               uuid    default null,
  p_name             text    default null,
  p_slug             text    default null,
  p_description      text    default null,
  p_category_id      uuid    default null,
  p_price            numeric default null,
  p_compare_at_price numeric default null,
  p_availability     text    default 'in-stock',
  p_badge            text    default null,
  p_colors           text[]  default '{}',
  p_sizes            text[]  default '{}',
  p_is_featured      boolean default false
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id    uuid;
  v_start int;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  -- ------------------------------------------------------------- validation
  if coalesce(length(trim(p_name)), 0) < 2 then
    raise exception 'A product name is required.';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'The slug may only contain lowercase letters, numbers and hyphens.';
  end if;
  if p_price is null or p_price < 0 then
    raise exception 'A valid price is required.';
  end if;
  if p_compare_at_price is not null and p_compare_at_price <= p_price then
    raise exception 'The compare-at price must be higher than the price.';
  end if;
  if p_availability not in ('in-stock', 'made-to-order') then
    raise exception 'Invalid status.';
  end if;
  if p_badge is not null and p_badge not in ('New', 'Best Seller', 'Sale') then
    raise exception 'Invalid badge.';
  end if;
  if coalesce(array_length(p_sizes, 1), 0) = 0 then
    raise exception 'At least one size is required.';
  end if;
  if not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'Choose a valid category.';
  end if;
  if exists (
    select 1 from public.products
    where slug = p_slug and (p_id is null or id <> p_id)
  ) then
    raise exception 'This slug is already in use.';
  end if;

  -- --------------------------------------------------------- insert / update
  if p_id is null then
    insert into public.products
      (name, slug, description, category_id, price, compare_at_price,
       availability, badge, colors, sizes, is_featured)
    values
      (trim(p_name), p_slug, nullif(trim(coalesce(p_description, '')), ''), p_category_id,
       p_price, p_compare_at_price, p_availability, p_badge, p_colors, p_sizes, p_is_featured)
    returning id into v_id;
  else
    update public.products set
      name             = trim(p_name),
      slug             = p_slug,
      description      = nullif(trim(coalesce(p_description, '')), ''),
      category_id      = p_category_id,
      price            = p_price,
      compare_at_price = p_compare_at_price,
      availability     = p_availability,
      badge            = p_badge,
      colors           = p_colors,
      sizes            = p_sizes,
      is_featured      = p_is_featured
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Product not found.';
    end if;
  end if;

  -- ------------------------------------- placeholder gallery for new products
  if not exists (select 1 from public.product_images where product_id = v_id) then
    v_start := abs(hashtext(p_slug)) % 8;
    insert into public.product_images (product_id, url, alt, sort_order)
    select
      v_id,
      '/images/products/p' || (((v_start + s) % 8) + 1) || '.jpg',
      trim(p_name),
      s
    from generate_series(0, 3) as s;
  end if;

  return jsonb_build_object('id', v_id, 'slug', p_slug);
end;
$$;

revoke all on function public.admin_save_product(
  uuid, text, text, text, uuid, numeric, numeric, text, text, text[], text[], boolean
) from public, anon;
grant execute on function public.admin_save_product(
  uuid, text, text, text, uuid, numeric, numeric, text, text, text[], text[], boolean
) to authenticated;

create or replace function public.admin_delete_product(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  -- product_images cascade; order_items keep their rows (product_id set null).
  delete from public.products where id = p_id;
  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    raise exception 'Product not found.';
  end if;

  return jsonb_build_object('deleted', true);
end;
$$;

revoke all on function public.admin_delete_product(uuid) from public, anon;
grant execute on function public.admin_delete_product(uuid) to authenticated;

-- =========================================================== product images

create or replace function public.admin_add_product_image(
  p_product_id uuid,
  p_url        text default null,
  p_alt        text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id   uuid;
  v_sort int;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'Product not found.';
  end if;
  if coalesce(length(trim(p_url)), 0) < 8 then
    raise exception 'A valid image URL is required.';
  end if;

  select coalesce(max(sort_order) + 1, 0) into v_sort
  from public.product_images
  where product_id = p_product_id;

  insert into public.product_images (product_id, url, alt, sort_order)
  values (p_product_id, trim(p_url), nullif(trim(coalesce(p_alt, '')), ''), v_sort)
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'url', trim(p_url), 'sort_order', v_sort);
end;
$$;

revoke all on function public.admin_add_product_image(uuid, text, text) from public, anon;
grant execute on function public.admin_add_product_image(uuid, text, text) to authenticated;

create or replace function public.admin_replace_product_image(
  p_id  uuid,
  p_url text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old text;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  if coalesce(length(trim(p_url)), 0) < 8 then
    raise exception 'A valid image URL is required.';
  end if;

  select url into v_old from public.product_images where id = p_id;
  if v_old is null then
    raise exception 'Image not found.';
  end if;

  update public.product_images set url = trim(p_url) where id = p_id;

  return jsonb_build_object('id', p_id, 'url', trim(p_url), 'old_url', v_old);
end;
$$;

revoke all on function public.admin_replace_product_image(uuid, text) from public, anon;
grant execute on function public.admin_replace_product_image(uuid, text) to authenticated;

create or replace function public.admin_delete_product_image(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url     text;
  v_product uuid;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  delete from public.product_images
  where id = p_id
  returning url, product_id into v_url, v_product;

  if v_url is null then
    raise exception 'Image not found.';
  end if;

  update public.product_images pi
  set sort_order = seq.rn - 1
  from (
    select id, row_number() over (order by sort_order) as rn
    from public.product_images
    where product_id = v_product
  ) seq
  where pi.id = seq.id
    and pi.sort_order <> seq.rn - 1;

  return jsonb_build_object('url', v_url);
end;
$$;

revoke all on function public.admin_delete_product_image(uuid) from public, anon;
grant execute on function public.admin_delete_product_image(uuid) to authenticated;

create or replace function public.admin_reorder_product_images(
  p_product_id uuid,
  p_image_ids  uuid[] default '{}'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  select count(*) into v_count
  from public.product_images
  where product_id = p_product_id;

  if v_count = 0
     or coalesce(array_length(p_image_ids, 1), 0) <> v_count
     or (select count(distinct id) from unnest(p_image_ids) as id) <> v_count then
    raise exception 'The new order must include every image of the product exactly once.';
  end if;

  if exists (
    select 1 from unnest(p_image_ids) as id
    where not exists (
      select 1 from public.product_images pi
      where pi.id = id and pi.product_id = p_product_id
    )
  ) then
    raise exception 'The new order contains an unknown image.';
  end if;

  update public.product_images pi
  set sort_order = pos.ordinality - 1
  from unnest(p_image_ids) with ordinality as pos(id, ordinality)
  where pi.id = pos.id
    and pi.sort_order <> pos.ordinality - 1;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.admin_reorder_product_images(uuid, uuid[]) from public, anon;
grant execute on function public.admin_reorder_product_images(uuid, uuid[]) to authenticated;

-- =================================================================== orders

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
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

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

revoke all on function public.admin_orders(text, text, text, integer, integer) from public, anon;
grant execute on function public.admin_orders(text, text, text, integer, integer) to authenticated;

create or replace function public.admin_order_details(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  return (
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
    where o.id = p_id
  );
end;
$$;

revoke all on function public.admin_order_details(uuid) from public, anon;
grant execute on function public.admin_order_details(uuid) to authenticated;

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
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

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

revoke all on function public.admin_update_order_status(uuid, text) from public, anon;
grant execute on function public.admin_update_order_status(uuid, text) to authenticated;

-- =============================================================== categories

create or replace function public.admin_save_category(
  p_id             uuid    default null,
  p_name           text    default null,
  p_slug           text    default null,
  p_description    text    default null,
  p_image_url      text    default null,
  p_sort_order     integer default 0,
  p_is_coming_soon boolean default false
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id        uuid;
  v_old_image text;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  -- ------------------------------------------------------------- validation
  if coalesce(length(trim(p_name)), 0) < 2 then
    raise exception 'A category name is required.';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'The slug may only contain lowercase letters, numbers and hyphens.';
  end if;
  if p_sort_order is null or p_sort_order < 0 then
    raise exception 'A valid sort order is required.';
  end if;
  if exists (
    select 1 from public.categories
    where slug = p_slug and (p_id is null or id <> p_id)
  ) then
    raise exception 'This slug is already in use.';
  end if;

  -- --------------------------------------------------------- insert / update
  if p_id is null then
    insert into public.categories
      (name, slug, description, image_url, sort_order, is_coming_soon)
    values
      (trim(p_name), p_slug, nullif(trim(coalesce(p_description, '')), ''),
       nullif(trim(coalesce(p_image_url, '')), ''), p_sort_order,
       coalesce(p_is_coming_soon, false))
    returning id into v_id;
  else
    select image_url into v_old_image from public.categories where id = p_id;
    if not found then
      raise exception 'Category not found.';
    end if;

    update public.categories set
      name           = trim(p_name),
      slug           = p_slug,
      description    = nullif(trim(coalesce(p_description, '')), ''),
      image_url      = nullif(trim(coalesce(p_image_url, '')), ''),
      sort_order     = p_sort_order,
      is_coming_soon = coalesce(p_is_coming_soon, false)
    where id = p_id
    returning id into v_id;
  end if;

  return jsonb_build_object('id', v_id, 'slug', p_slug, 'old_image_url', v_old_image);
end;
$$;

revoke all on function public.admin_save_category(
  uuid, text, text, text, text, integer, boolean
) from public, anon;
grant execute on function public.admin_save_category(
  uuid, text, text, text, text, integer, boolean
) to authenticated;

create or replace function public.admin_delete_category(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_image text;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  if exists (select 1 from public.products where category_id = p_id) then
    raise exception 'This category still contains products — move or delete them first.';
  end if;

  delete from public.categories where id = p_id returning image_url into v_image;
  if not found then
    raise exception 'Category not found.';
  end if;

  return jsonb_build_object('deleted', true, 'image_url', v_image);
end;
$$;

revoke all on function public.admin_delete_category(uuid) from public, anon;
grant execute on function public.admin_delete_category(uuid) to authenticated;

-- ================================================================ customers

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
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

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

revoke all on function public.admin_customers(text, text, integer, integer) from public, anon;
grant execute on function public.admin_customers(text, text, integer, integer) to authenticated;

create or replace function public.admin_customer_details(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  return (
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
    where c.id = p_id
  );
end;
$$;

revoke all on function public.admin_customer_details(uuid) from public, anon;
grant execute on function public.admin_customer_details(uuid) to authenticated;

-- ================================================== storage: admin-only writes

drop policy if exists "Admin upload products bucket" on storage.objects;
create policy "Admin upload products bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin update products bucket" on storage.objects;
create policy "Admin update products bucket"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin delete products bucket" on storage.objects;
create policy "Admin delete products bucket"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- Make PostgREST pick up the new functions immediately.
notify pgrst, 'reload schema';
