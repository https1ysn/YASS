-- ============================================================================
-- Yasso Store — categories management (admin)
-- SECURITY DEFINER functions the admin uses to write categories while the
-- table stays locked for writes under RLS (reads are already public).
--
-- Deleting a category with products is refused so no product is ever left
-- orphaned (products.category_id is ON DELETE RESTRICT as a second guard).
--
-- NOTE: until admin authentication ships in a later phase, these functions are
-- callable with the public key — restrict the grants once auth exists.
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

-- ----------------------------------------------------- admin_save_category()
-- Insert (p_id null) or update (p_id set). Returns the previous image URL on
-- update so the caller can clean up a replaced or removed storage file.
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

-- --------------------------------------------------- admin_delete_category()
-- Refuses to delete a category that still contains products. Returns the
-- image URL so the caller can clean up storage.
create or replace function public.admin_delete_category(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_image text;
begin
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

-- ------------------------------------------------------------------- grants
revoke all on function public.admin_save_category(
  uuid, text, text, text, text, integer, boolean
) from public;
grant execute on function public.admin_save_category(
  uuid, text, text, text, text, integer, boolean
) to anon, authenticated;

revoke all on function public.admin_delete_category(uuid) from public;
grant execute on function public.admin_delete_category(uuid) to anon, authenticated;

-- Make PostgREST pick up the new functions immediately.
notify pgrst, 'reload schema';
