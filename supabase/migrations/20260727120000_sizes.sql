-- ============================================================================
-- Yasso Store — global size management (admin)
--
-- Sizes used to be typed by hand into a comma-separated field on every product.
-- They now live in their own table so the admin maintains one canonical list and
-- every product form offers the same options.
--
--   * `sizes` — id / name / sort_order / active / created_at / updated_at.
--     RLS on with a public read policy (the storefront filters by size);
--     all writes flow through the SECURITY DEFINER RPCs below.
--   * `admin_save_size()`     — create (p_id null) or update.
--   * `admin_delete_size()`   — remove one size.
--   * `admin_reorder_sizes()` — persist a drag-and-drop ordering in one call.
--
-- Guarded by is_admin() and granted to `authenticated` only, matching the
-- convention established in 20260715130000_is_admin_any_authenticated.sql.
-- `products.sizes` stays a text[] of size NAMES — no destructive change to any
-- existing product, and a product keeps rendering a size the admin later
-- renames or deletes.
--
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

-- ----------------------------------------------------------------- sizes
create table if not exists public.sizes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  sort_order integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One size per label, case-insensitively ("m" and "M" are the same size).
create unique index if not exists sizes_name_unique on public.sizes (lower(name));
create index if not exists sizes_sort_order_idx on public.sizes (sort_order, name);

alter table public.sizes enable row level security;

-- Reads are public: the storefront needs the list to build size filters.
drop policy if exists "Public read sizes" on public.sizes;
create policy "Public read sizes"
  on public.sizes for select
  to anon, authenticated
  using (true);

-- Seed the standard apparel run. `on conflict do nothing` keeps re-runs safe
-- and never clobbers a list the admin has already curated.
insert into public.sizes (name, sort_order)
values ('XS', 1), ('S', 2), ('M', 3), ('L', 4),
       ('XL', 5), ('XXL', 6), ('XXXL', 7)
on conflict do nothing;

-- ------------------------------------------------------------ admin_save_size()
create or replace function public.admin_save_size(
  p_id         uuid    default null,
  p_name       text    default null,
  p_sort_order integer default 0,
  p_active     boolean default true
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id   uuid;
  v_name text := trim(coalesce(p_name, ''));
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  if length(v_name) < 1 then
    raise exception 'A size name is required.';
  end if;
  if length(v_name) > 20 then
    raise exception 'Keep size names under 20 characters.';
  end if;
  if p_sort_order is null or p_sort_order < 0 then
    raise exception 'A valid sort order is required.';
  end if;
  if exists (
    select 1 from public.sizes
    where lower(name) = lower(v_name) and (p_id is null or id <> p_id)
  ) then
    raise exception 'That size already exists.';
  end if;

  if p_id is null then
    insert into public.sizes (name, sort_order, active)
    values (v_name, p_sort_order, coalesce(p_active, true))
    returning id into v_id;
  else
    update public.sizes set
      name       = v_name,
      sort_order = p_sort_order,
      active     = coalesce(p_active, true),
      updated_at = now()
    where id = p_id
    returning id into v_id;

    if not found then
      raise exception 'Size not found.';
    end if;
  end if;

  return jsonb_build_object('id', v_id, 'name', v_name);
end;
$$;

-- ---------------------------------------------------------- admin_delete_size()
-- Products store size NAMES, so deleting a size never orphans a product row —
-- it only stops offering that option on future edits. The count of products
-- still referencing the name comes back so the UI can warn before deleting.
create or replace function public.admin_delete_size(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name  text;
  v_using integer;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  select name into v_name from public.sizes where id = p_id;
  if not found then
    raise exception 'Size not found.';
  end if;

  select count(*) into v_using from public.products where v_name = any (sizes);

  delete from public.sizes where id = p_id;

  return jsonb_build_object('deleted', true, 'name', v_name, 'products_using', v_using);
end;
$$;

-- -------------------------------------------------------- admin_reorder_sizes()
-- Persists a whole drag-and-drop ordering atomically: position in the array
-- becomes sort_order. Ids not present in the array keep their current order.
create or replace function public.admin_reorder_sizes(p_ids uuid[] default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'No ordering was provided.';
  end if;

  update public.sizes as s
  set sort_order = ordered.position,
      updated_at = now()
  from (
    select id, ordinality::integer as position
    from unnest(p_ids) with ordinality as t(id, ordinality)
  ) as ordered
  where s.id = ordered.id
    and s.sort_order is distinct from ordered.position;

  get diagnostics v_updated = row_count;
  return jsonb_build_object('updated', v_updated);
end;
$$;

-- ------------------------------------------------------------------- grants
revoke all on function public.admin_save_size(uuid, text, integer, boolean) from public, anon;
grant execute on function public.admin_save_size(uuid, text, integer, boolean) to authenticated;

revoke all on function public.admin_delete_size(uuid) from public, anon;
grant execute on function public.admin_delete_size(uuid) to authenticated;

revoke all on function public.admin_reorder_sizes(uuid[]) from public, anon;
grant execute on function public.admin_reorder_sizes(uuid[]) to authenticated;

-- Make PostgREST pick up the new table and functions immediately.
notify pgrst, 'reload schema';
