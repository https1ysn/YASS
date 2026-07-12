import { cache } from "react";
import { isSupabaseConfigured } from "./supabase/config";
import { createSupabaseServerClient } from "./supabase/server";
import { DEFAULT_SETTINGS, siteSettingsSchema, type SiteSettings } from "@/schemas/admin-settings";

export { DEFAULT_SETTINGS, type SiteSettings };

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
    const parsed = siteSettingsSchema.safeParse(data);
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
