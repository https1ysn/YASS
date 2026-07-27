-- ============================================================================
-- Website settings — split `theme` into independent light and dark palettes
--
-- `theme` was one flat palette of token → hex, applied to the storefront in
-- both light and dark mode. It becomes:
--
--   theme.light : { <token>: <hex>, … }
--   theme.dark  : { <token>: <hex>, … }
--
-- The existing flat palette moves to `theme.light`, and `theme.dark` starts
-- empty (every token on its built-in dark value).
--
-- WHY NOT COPY IT INTO BOTH — copying the old palette into `dark` as well would
-- look like the more faithful migration, but it reproduces the exact failure
-- this split exists to remove: a light `background` saved under `dark` sits
-- beneath dark-mode text, which measured 1.24:1 on this very install. Light-only
-- keeps the storefront rendering identically to today in light mode and gives
-- dark mode a coherent built-in palette. Admins who do want the palette
-- mirrored have "Copy Light → Dark" in the Theme editor.
--
-- Blank values are dropped rather than carried over: "" already means "use the
-- built-in color", so storing it is noise.
--
-- Safe to run against any existing install:
--   * Idempotent — the WHERE clause skips a blob whose `theme` is already
--     split, so re-running changes nothing.
--   * Non-destructive — no other section is touched, and no color is lost:
--     every non-empty token lands in `theme.light`.
--   * Not required for a fresh install — an untouched `{}` blob is left alone
--     and the application defaults fill both palettes in.
--
-- Deploy order does not matter: the application also folds a flat palette into
-- `light` at read time (adoptLegacyFlatTheme in src/lib/settings.ts), so the
-- storefront renders correctly whether the code or this migration lands first.
--
-- Apply with the Supabase SQL editor (paste & run) or `supabase db push`.
-- ============================================================================

update public.site_settings
set
  data = jsonb_set(
    data,
    '{theme}',
    jsonb_build_object(
      'light',
      coalesce(
        (select jsonb_object_agg(key, value)
         from jsonb_each(data -> 'theme')
         -- Keep real colors only: skip blanks and any nested object.
         where jsonb_typeof(value) = 'string'
           and btrim(value #>> '{}') <> ''),
        '{}'::jsonb
      ),
      'dark', '{}'::jsonb
    )
  ),
  updated_at = now()
where id = 1
  and jsonb_typeof(data) = 'object'
  and jsonb_typeof(data -> 'theme') = 'object'
  -- Only a still-flat palette: bail out once light/dark exist.
  and not (data -> 'theme' ? 'light')
  and not (data -> 'theme' ? 'dark');
