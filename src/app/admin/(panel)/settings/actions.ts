"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/session";
import { isProductStorageUrl } from "@/lib/supabase/storage";
import { siteSettingsSchema, type SiteSettings } from "@/schemas/admin-settings";

export type SaveSettingsResult = { ok: true } | { ok: false; error: string };

function friendlyError(message: string, code?: string): string {
  if (code === "PGRST202" || /admin_save_settings|get_site_settings|site_settings/i.test(message)) {
    return "Settings aren't fully set up yet — apply the latest database migration (20260712120000_site_settings.sql) and try again.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONN|timeout/i.test(message)) {
    return "We couldn't reach the database. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/** An uploaded asset must live in our own bucket (or be a local placeholder). */
function isAllowedAsset(url: string | null): boolean {
  return !url || isProductStorageUrl(url) || url.startsWith("/images/") || url.startsWith("/");
}

/** Persist the full website settings blob via the admin RPC. */
export async function saveSettings(input: SiteSettings): Promise<SaveSettingsResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }
  const data = parsed.data;

  // Only accept imagery from our own bucket or the app's local assets.
  for (const asset of [data.branding.logoUrl, data.branding.faviconUrl, data.seo.ogImageUrl]) {
    if (!isAllowedAsset(asset)) {
      return { ok: false, error: "Uploaded images must be sent to the storage bucket first." };
    }
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("admin_save_settings", { p_data: data });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    // Every storefront route reads settings — refresh the whole tree.
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}
