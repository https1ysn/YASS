import { cache } from "react";
import { isSupabaseConfigured } from "./supabase/config";
import { createSupabaseServerClient } from "./supabase/server";
import { DEFAULT_SETTINGS, siteSettingsSchema, type SiteSettings } from "@/schemas/admin-settings";
import {
  LEGACY_BRANDING_COLORS,
  THEME_TOKENS,
  type ThemePalette,
  type ThemeTokenKey,
} from "@/lib/theme-tokens";

export { DEFAULT_SETTINGS, type SiteSettings };

/**
 * Brand identity used to live in a `general` section; it now sits in
 * `branding` (see 20260724120000_branding_settings.sql). This adopts a
 * not-yet-migrated blob at read time so the storefront renders the real name
 * and logo no matter which lands first, the deploy or the migration. Anything
 * already set on `branding` wins, so a save from the new form is never undone.
 */
function adoptLegacyBranding(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;

  const blob = raw as Record<string, unknown>;
  const general = blob.general;
  if (!general || typeof general !== "object" || Array.isArray(general)) return raw;

  const legacy = general as Record<string, unknown>;
  const branding: Record<string, unknown> =
    blob.branding && typeof blob.branding === "object" && !Array.isArray(blob.branding)
      ? { ...(blob.branding as Record<string, unknown>) }
      : {};

  // Blank strings fall through to the schema defaults rather than being copied.
  const filled = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : undefined;

  branding.websiteName ??= filled(legacy.storeName);
  branding.tagline ??= filled(legacy.tagline);
  // A stored null means "no image set" and must survive as null, so these copy
  // on key presence rather than on truthiness.
  if (!("logoUrl" in branding) && "logoUrl" in legacy) branding.logoUrl = legacy.logoUrl;
  if (!("faviconUrl" in branding) && "faviconUrl" in legacy) {
    branding.faviconUrl = legacy.faviconUrl;
  }

  const { general: _legacySection, ...rest } = blob;
  return { ...rest, branding };
}

/**
 * The five `branding.*Color` fields became first-class theme tokens (see
 * 20260727130000_theme_settings.sql). This adopts a not-yet-migrated blob at
 * read time so a deploy that lands before the migration still renders the
 * saved palette.
 *
 * A legacy color equal to its old default was never applied to the storefront
 * — the previous generator skipped unchanged values — so copying it would
 * change how a live site looks. Those are skipped, leaving the token unset and
 * the built-in adaptive value in place.
 */
function adoptLegacyThemeColors(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;

  const blob = raw as Record<string, unknown>;
  const branding = blob.branding;
  if (!branding || typeof branding !== "object" || Array.isArray(branding)) return raw;

  const legacy = branding as Record<string, unknown>;
  const theme: Record<string, unknown> =
    blob.theme && typeof blob.theme === "object" && !Array.isArray(blob.theme)
      ? { ...(blob.theme as Record<string, unknown>) }
      : {};

  let adopted = false;
  for (const { legacyKey, token, legacyDefault } of LEGACY_BRANDING_COLORS) {
    const value = legacy[legacyKey];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === legacyDefault) continue;
    // An explicit theme value always wins over the legacy one.
    if (!theme[token]) {
      theme[token] = trimmed;
      adopted = true;
    }
  }

  // The secondary color used to drive the focus ring too.
  const legacySecondary = typeof legacy.secondaryColor === "string" ? legacy.secondaryColor.trim() : "";
  if (legacySecondary && legacySecondary.toLowerCase() !== "#ad7d56" && !theme.ring) {
    theme.ring = legacySecondary;
    adopted = true;
  }

  if (!adopted && !blob.theme) return raw;

  // Drop the legacy color keys so they can't drift out of sync with the theme.
  const cleanedBranding = { ...legacy };
  for (const { legacyKey } of LEGACY_BRANDING_COLORS) delete cleanedBranding[legacyKey];

  return { ...blob, branding: cleanedBranding, theme };
}

/**
 * Live website settings, read from the single global row through the public
 * `get_site_settings` RPC and merged over the defaults so callers always get a
 * complete object. Wrapped in React `cache()` so one request hits the database
 * once no matter how many components read it. Any failure (Supabase not
 * configured, migration not yet applied, network) degrades to the defaults so
 * the storefront never breaks.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_site_settings");
    if (error || !data || typeof data !== "object") return DEFAULT_SETTINGS;

    // Nested field-level defaults fill any gaps in a partial blob. The shims
    // run oldest-shape-first: general → branding colors → flat theme → split.
    const parsed = siteSettingsSchema.safeParse(
      adoptLegacyFlatTheme(adoptLegacyThemeColors(adoptLegacyBranding(data)))
    );
    return parsed.success ? parsed.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
});

/**
 * `theme` used to be one flat palette applied to both modes; it is now split
 * into `{ light, dark }`. A pre-split blob is folded into `light` at read time
 * so a deploy landing before the migration keeps rendering the saved colors.
 *
 * The flat palette goes to `light` ONLY, never to both. Copying it into `dark`
 * would put light surfaces under dark-mode text — exactly the unreadable
 * pairing this split exists to prevent. Dark starts on the built-in palette,
 * and "Copy Light → Dark" in the editor is there for admins who do want it
 * mirrored.
 */
function adoptLegacyFlatTheme(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;

  const blob = raw as Record<string, unknown>;
  const theme = blob.theme;
  if (!theme || typeof theme !== "object" || Array.isArray(theme)) return raw;

  const flat = theme as Record<string, unknown>;
  const asPalette = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
      ? { ...(value as Record<string, unknown>) }
      : {};

  const known = new Set(THEME_TOKENS.map((token) => token.key));
  const light = asPalette(flat.light);

  // Loose token keys can sit alongside `light`/`dark` when an older shim ran
  // first; fold them in without letting them clobber an explicit light value.
  let folded = 0;
  for (const [key, value] of Object.entries(flat)) {
    if (!known.has(key) || typeof value !== "string" || !value.trim()) continue;
    folded += 1;
    if (!light[key]) light[key] = value.trim();
  }

  if (folded === 0) return raw;
  return { ...blob, theme: { light, dark: asPalette(flat.dark) } };
}

/** The overridden tokens of one palette, as CSS declarations. */
function paletteVars(palette: ThemePalette): string {
  return THEME_TOKENS.map((token) => {
    const value = palette[token.key as ThemeTokenKey]?.trim();
    return value ? `${token.cssVar}:${value};` : "";
  }).join("");
}

/**
 * The admin's palettes as a complete stylesheet — light rules outside `.dark`,
 * dark rules inside it.
 *
 * The two selectors are mutually exclusive and carry equal specificity, so each
 * palette only ever paints its own mode and a token left blank in one mode is
 * never leaked into the other. Everything unset keeps the built-in
 * `light-dark()` value from globals.css, which resolves against the
 * `color-scheme` that the existing `.light` / `.dark` classes already set —
 * this generator deliberately does not touch `color-scheme` itself.
 *
 * Returns "" when neither palette is customized, so the caller skips the tag.
 */
export function themeCssVars(settings: SiteSettings): string {
  const light = paletteVars(settings.theme.light);
  const dark = paletteVars(settings.theme.dark);

  // Server-rendered HTML carries no theme class until the inline script runs,
  // so `:not(.dark)` is what makes the light palette the pre-hydration default.
  return `${light ? `:root:not(.dark){${light}}` : ""}${dark ? `:root.dark{${dark}}` : ""}`;
}

