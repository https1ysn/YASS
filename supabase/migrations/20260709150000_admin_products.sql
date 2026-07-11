-- ============================================================================
-- Yasso Store — products management (admin CRUD)
-- Adds the `is_featured` flag and the two SECURITY DEFINER functions the admin
-- uses to write products while the tables stay locked under RLS.
--
-- NOTE: until admin authentication ships in a later phase, these functions are
-- callable with the public key — restrict the grants once auth exists.
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

alter table public.products
  add column if not exists is_featured boolean not null default false;

create index if not exists products_created_at_idx on public.products (created_at desc);

-- ------------------------------------------------------ admin_save_product()
-- Insert (p_id null) or update (p_id set). New products with no imagery get a
-- deterministic 4-image placeholder gallery so they render on the storefront.
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

-- ---------------------------------------------------- admin_delete_product()
create or replace function public.admin_delete_product(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  -- product_images cascade; order_items keep their rows (product_id set null).
  delete from public.products where id = p_id;
  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    raise exception 'Product not found.';
  end if;

  return jsonb_build_object('deleted', true);
end;
$$;

revoke all on function public.admin_save_product(
  uuid, text, text, text, uuid, numeric, numeric, text, text, text[], text[], boolean
) from public;
grant execute on function public.admin_save_product(
  uuid, text, text, text, uuid, numeric, numeric, text, text, text[], text[], boolean
) to anon, authenticated;

revoke all on function public.admin_delete_product(uuid) from public;
grant execute on function public.admin_delete_product(uuid) to anon, authenticated;

-- Make PostgREST pick up the new functions immediately.
notify pgrst, 'reload schema';
