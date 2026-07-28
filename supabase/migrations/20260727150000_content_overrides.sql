-- ============================================================================
-- Yasso Store — editable storefront copy (admin CMS)
--
-- Every user-facing string already lives in messages/{en,fr,ar}.json and is
-- read through next-intl. This table lets the admin override any of those keys
-- per locale WITHOUT touching the files: the request config merges overrides on
-- top of the shipped catalog, so an unset key keeps its translated default and
-- a deleted row reverts instantly.
--
--   * `content_overrides` — (locale, key) -> value. RLS on with a public read
--     policy, because the storefront renders these on every request.
--   * `admin_save_content()` — upsert a batch for one locale. An empty string
--     DELETES the row, which is how "reset to default" is expressed.
--
-- Keys are dot paths into the message catalog ("home.featuredCategories.title",
-- "shippingReturns.0"). Nothing here is validated against the catalog on the
-- database side: the shipped file stays the source of truth for which keys
-- exist, and an override for a key that no longer exists is simply ignored by
-- the merge. That keeps this table from blocking a copy refactor.
--
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

create table if not exists public.content_overrides (
  locale     text not null,
  key        text not null,
  value      text not null,
  updated_at timestamptz not null default now(),
  primary key (locale, key),
  constraint content_overrides_locale_check check (locale in ('en', 'fr', 'ar')),
  constraint content_overrides_key_check check (length(key) between 1 and 200),
  constraint content_overrides_value_check check (length(value) <= 5000)
);

create index if not exists content_overrides_locale_idx on public.content_overrides (locale);

alter table public.content_overrides enable row level security;

-- Public read: the storefront merges these into its messages on every render.
drop policy if exists "Public read content overrides" on public.content_overrides;
create policy "Public read content overrides"
  on public.content_overrides for select
  to anon, authenticated
  using (true);

-- --------------------------------------------------------- admin_save_content()
-- Takes one locale and a flat json object of { "<key>": "<value>" }.
-- A blank value removes the override so the shipped translation takes over.
create or replace function public.admin_save_content(
  p_locale  text  default null,
  p_entries jsonb default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saved   integer := 0;
  v_cleared integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized.';
  end if;

  if p_locale is null or p_locale not in ('en', 'fr', 'ar') then
    raise exception 'Unknown locale.';
  end if;
  if p_entries is null or jsonb_typeof(p_entries) <> 'object' then
    raise exception 'Invalid content payload.';
  end if;

  -- Blank values: drop the override entirely.
  with cleared as (
    delete from public.content_overrides c
    using jsonb_each_text(p_entries) as e(key, value)
    where c.locale = p_locale
      and c.key = e.key
      and btrim(e.value) = ''
    returning 1
  )
  select count(*) into v_cleared from cleared;

  with upserted as (
    insert into public.content_overrides (locale, key, value, updated_at)
    select p_locale, e.key, e.value, now()
    from jsonb_each_text(p_entries) as e(key, value)
    where btrim(e.value) <> ''
    on conflict (locale, key) do update
      set value = excluded.value,
          updated_at = now()
    returning 1
  )
  select count(*) into v_saved from upserted;

  return jsonb_build_object('saved', v_saved, 'cleared', v_cleared);
end;
$$;

revoke all on function public.admin_save_content(text, jsonb) from public, anon;
grant execute on function public.admin_save_content(text, jsonb) to authenticated;

-- Make PostgREST pick up the new table and function immediately.
notify pgrst, 'reload schema';
