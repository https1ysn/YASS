-- ============================================================================
-- Yasso Store — product image management (admin)
-- SECURITY DEFINER functions the admin uses to manage product_images while
-- the table stays locked under RLS, plus write policies on the existing
-- public "products" storage bucket so the admin can upload/delete files.
--
-- The primary image is simply the one with the lowest sort_order — the
-- storefront already renders images in sort_order, so no new columns needed.
--
-- NOTE: until admin authentication ships in a later phase, these functions
-- and policies are usable with the public key — restrict them once auth
-- exists. Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

-- -------------------------------------------------- admin_add_product_image()
-- Appends an image to the end of a product's gallery.
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

-- ---------------------------------------------- admin_replace_product_image()
-- Swaps the file behind an existing gallery entry, keeping its position and
-- alt text. Returns the old URL so the caller can clean up storage.
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

-- ----------------------------------------------- admin_delete_product_image()
-- Removes a gallery entry and closes the sort_order gap. Returns the URL so
-- the caller can clean up storage.
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

-- --------------------------------------------- admin_reorder_product_images()
-- Persists a full new order for a product's gallery. The array must contain
-- every image of the product exactly once; position 0 becomes the primary.
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

-- ------------------------------------------------------------------- grants
revoke all on function public.admin_add_product_image(uuid, text, text) from public;
grant execute on function public.admin_add_product_image(uuid, text, text)
  to anon, authenticated;

revoke all on function public.admin_replace_product_image(uuid, text) from public;
grant execute on function public.admin_replace_product_image(uuid, text)
  to anon, authenticated;

revoke all on function public.admin_delete_product_image(uuid) from public;
grant execute on function public.admin_delete_product_image(uuid)
  to anon, authenticated;

revoke all on function public.admin_reorder_product_images(uuid, uuid[]) from public;
grant execute on function public.admin_reorder_product_images(uuid, uuid[])
  to anon, authenticated;

-- ============================================================================
-- Storage: allow writes to the existing public "products" bucket so the admin
-- can upload, replace and delete imagery. Restrict once admin auth exists.
-- ============================================================================

drop policy if exists "Admin upload products bucket" on storage.objects;
create policy "Admin upload products bucket"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'products');

drop policy if exists "Admin update products bucket" on storage.objects;
create policy "Admin update products bucket"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'products')
  with check (bucket_id = 'products');

drop policy if exists "Admin delete products bucket" on storage.objects;
create policy "Admin delete products bucket"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'products');

-- Make PostgREST pick up the new functions immediately.
notify pgrst, 'reload schema';
