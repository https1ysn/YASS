-- ============================================================================
-- Website settings — fold brand identity into the `branding` section
--
-- The header, footer, admin shell, page titles and Open Graph tags now all read
-- the brand from one place: `branding.websiteName` / `branding.logoUrl`. Those
-- values used to live in a separate `general` section, so this migration moves
-- the four identity fields across and drops `general`:
--
--   general.storeName  -> branding.websiteName
--   general.tagline    -> branding.tagline
--   general.logoUrl    -> branding.logoUrl
--   general.faviconUrl -> branding.faviconUrl
--
-- Safe to run against any existing install:
--   * Idempotent — the WHERE clause skips rows that no longer carry `general`,
--     so re-running (or running after the new code has already saved) is a
--     no-op rather than a rollback of newer values.
--   * Non-destructive — `branding` keeps every color already stored; only the
--     four identity keys are added, and only when the old section held them.
--   * Blank-safe — an empty or whitespace-only store name is not copied, so the
--     application default seeds the name instead of an unusable empty string.
--   * Not required for a fresh install — an untouched `{}` blob is left alone
--     and the application-layer defaults fill everything in.
--
-- Deploy order: apply this BEFORE (or together with) the release that reads
-- `branding.websiteName`. Deploying the code first is still safe — settings
-- would fall back to the defaults for one render, and applying this migration
-- restores the saved values without a further deploy.
--
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

update public.site_settings
set
  data = (data - 'general') || jsonb_build_object(
    'branding',
    coalesce(data -> 'branding', '{}'::jsonb)
      -- Text fields: skip blanks so they fall through to the app defaults.
      || jsonb_strip_nulls(
           jsonb_build_object(
             'websiteName', nullif(btrim(coalesce(data -> 'general' ->> 'storeName', '')), ''),
             'tagline',     nullif(btrim(coalesce(data -> 'general' ->> 'tagline', '')), '')
           )
         )
      -- Image fields: a stored null means "no image set" and must be preserved
      -- as such, so copy on key presence rather than on value.
      || (case
            when jsonb_exists(data -> 'general', 'logoUrl')
            then jsonb_build_object('logoUrl', data -> 'general' -> 'logoUrl')
            else '{}'::jsonb
          end)
      || (case
            when jsonb_exists(data -> 'general', 'faviconUrl')
            then jsonb_build_object('faviconUrl', data -> 'general' -> 'faviconUrl')
            else '{}'::jsonb
          end)
  ),
  updated_at = now()
where id = 1
  and jsonb_typeof(data) = 'object'
  and jsonb_exists(data, 'general')
  and jsonb_typeof(data -> 'general') = 'object';
