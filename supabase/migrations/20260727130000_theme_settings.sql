-- ============================================================================
-- Website settings — promote the five brand colors to a full `theme` section
--
-- Website Settings used to carry five colors on `branding` (primaryColor,
-- secondaryColor, accentColor, successColor, errorColor). The Theme editor now
-- exposes every design token, so those five move into `theme` under their token
-- names and the legacy keys are dropped:
--
--   branding.primaryColor   -> theme.primary
--   branding.secondaryColor -> theme.secondary  (+ theme.ring)
--   branding.accentColor    -> theme.accent
--   branding.successColor   -> theme.success
--   branding.errorColor     -> theme.danger
--
-- IMPORTANT — values equal to the old defaults are NOT copied. The previous
-- generator (lib/settings.ts brandingCssVars) only emitted a CSS variable when
-- a color differed from its default, so a stored default was never actually
-- painted on the storefront. Copying it would silently restyle a live site, so
-- those tokens are left unset and keep the built-in adaptive `light-dark()`
-- value from globals.css instead.
--
-- Safe to run against any existing install:
--   * Idempotent — the WHERE clause skips rows whose `branding` no longer
--     carries the legacy keys, so re-running is a no-op.
--   * Non-destructive — every other section, and every branding identity field
--     (websiteName, tagline, logoUrl, faviconUrl), is preserved untouched.
--   * Not required for a fresh install — an untouched `{}` blob is left alone.
--
-- Deploy order does not matter: the application also adopts the legacy shape at
-- read time (adoptLegacyThemeColors in src/lib/settings.ts), so the palette
-- renders correctly whether the code or this migration lands first.
--
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

update public.site_settings
set
  data = jsonb_set(
    data,
    '{branding}',
    (data -> 'branding')
      - 'primaryColor' - 'secondaryColor' - 'accentColor'
      - 'successColor' - 'errorColor'
  ) || jsonb_build_object(
    'theme',
    coalesce(data -> 'theme', '{}'::jsonb)
      -- Only colors the admin actually changed away from the old defaults.
      || jsonb_strip_nulls(jsonb_build_object(
           'primary',   nullif(lower(btrim(coalesce(data -> 'branding' ->> 'primaryColor',   ''))), '#000000'),
           'secondary', nullif(lower(btrim(coalesce(data -> 'branding' ->> 'secondaryColor', ''))), '#ad7d56'),
           -- The secondary color drove the focus ring under the old generator.
           'ring',      nullif(lower(btrim(coalesce(data -> 'branding' ->> 'secondaryColor', ''))), '#ad7d56'),
           'accent',    nullif(lower(btrim(coalesce(data -> 'branding' ->> 'accentColor',    ''))), '#c2916a'),
           'success',   nullif(lower(btrim(coalesce(data -> 'branding' ->> 'successColor',   ''))), '#3f7a4e'),
           'danger',    nullif(lower(btrim(coalesce(data -> 'branding' ->> 'errorColor',     ''))), '#b3402f')
         ))
  ),
  updated_at = now()
where id = 1
  and jsonb_typeof(data) = 'object'
  and jsonb_typeof(data -> 'branding') = 'object'
  and (
    jsonb_exists(data -> 'branding', 'primaryColor')
    or jsonb_exists(data -> 'branding', 'secondaryColor')
    or jsonb_exists(data -> 'branding', 'accentColor')
    or jsonb_exists(data -> 'branding', 'successColor')
    or jsonb_exists(data -> 'branding', 'errorColor')
  );

-- An empty string ('') means "unset" in the application schema, and
-- jsonb_strip_nulls above only removes SQL nulls — clear any blanks that a
-- previous save may have written so they round-trip as "inherit the default".
update public.site_settings
set data = jsonb_set(
  data,
  '{theme}',
  (select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
   from jsonb_each(data -> 'theme')
   where value <> '""'::jsonb)
)
where id = 1
  and jsonb_typeof(data -> 'theme') = 'object'
  and exists (select 1 from jsonb_each(data -> 'theme') where value = '""'::jsonb);
