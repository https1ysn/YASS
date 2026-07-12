-- ============================================================================
-- Yasso Store — website settings (admin)
-- A single global-settings row lifts every storefront configuration out of the
-- codebase (branding, announcement bar, contact, social, SEO, homepage copy,
-- maintenance mode …) and into the Admin Dashboard.
--
--   * `site_settings` — one row (id = 1) holding a `data` jsonb blob so new
--     settings can ship without a migration per field. RLS on, no public
--     policies: the table is only reachable through the two RPCs below.
--   * `get_site_settings()`  — public read (storefront + admin) via SECURITY
--     DEFINER, so the storefront renders the live configuration.
--   * `admin_save_settings()` — admin-only write, guarded by is_admin() exactly
--     like every other admin_* function (see 20260710160000_admin_auth_hardening).
--
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

-- --------------------------------------------------------------- site_settings
create table if not exists public.site_settings (
  id         integer primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Seed the single global row so reads always find it.
insert into public.site_settings (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;
-- No policies on purpose: all access flows through the SECURITY DEFINER RPCs.

-- -------------------------------------------------------- get_site_settings()
-- Public read — the storefront renders branding, announcement, SEO and copy
-- straight from this. Returns the raw settings blob (defaults are merged in the
-- application layer, src/lib/settings.ts).
create or replace function public.get_site_settings()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select data from public.site_settings where id = 1),
    '{}'::jsonb
  );
$$;

revoke all on function public.get_site_settings() from public;
grant execute on function public.get_site_settings() to anon, authenticated;

-- ------------------------------------------------------ admin_save_settings()
-- Admin-only write. Replaces the settings blob wholesale (the form always
-- submits the complete object) and stamps updated_at. Returns the saved data.
create or replace function public.admin_save_settings(p_data jsonb default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_data jsonb;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'Invalid settings payload.';
  end if;

  insert into public.site_settings (id, data, updated_at)
  values (1, p_data, now())
  on conflict (id) do update
    set data = excluded.data,
        updated_at = now()
  returning data into v_data;

  return v_data;
end;
$$;

revoke all on function public.admin_save_settings(jsonb) from public, anon;
grant execute on function public.admin_save_settings(jsonb) to authenticated;

-- Make PostgREST pick up the new functions immediately.
notify pgrst, 'reload schema';
