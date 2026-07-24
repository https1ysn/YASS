import { cache } from "react";
import { isSupabaseConfigured } from "./supabase/config";
import { createSupabaseServerClient } from "./supabase/server";
import { DEFAULT_SETTINGS, siteSettingsSchema, type SiteSettings } from "@/schemas/admin-settings";

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

    // Nested field-level defaults fill any gaps in a partial blob.
    const parsed = siteSettingsSchema.safeParse(adoptLegacyBranding(data));
    return parsed.success ? parsed.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
});

/**
 * The branding tokens the admin has customized away from the design-system
 * defaults, as CSS custom properties. Only changed values are emitted so the
 * storefront keeps its light/dark adaptive tokens everywhere the admin hasn't
 * overridden. Returns "" when nothing is customized.
 */
export function brandingCssVars(settings: SiteSettings): string {
  const { branding } = settings;
  const d = DEFAULT_SETTINGS.branding;

  const map: Array<[string, string, string]> = [
    ["--primary", branding.primaryColor, d.primaryColor],
    ["--secondary", branding.secondaryColor, d.secondaryColor],
    ["--ring", branding.secondaryColor, d.secondaryColor],
    ["--accent", branding.accentColor, d.accentColor],
    ["--success", branding.successColor, d.successColor],
    ["--danger", branding.errorColor, d.errorColor],
  ];

  const vars = map
    .filter(([, value, fallback]) => value.toLowerCase() !== fallback.toLowerCase())
    .map(([name, value]) => `${name}:${value};`)
    .join("");

  return vars;
}
