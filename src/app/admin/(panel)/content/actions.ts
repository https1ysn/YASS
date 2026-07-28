"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/session";
import { routing } from "@/i18n/routing";

export type SaveContentResult =
  | { ok: true; saved: number; cleared: number }
  | { ok: false; error: string };

const MAX_VALUE_LENGTH = 5000;

function friendlyError(message: string, code?: string): string {
  if (code === "42501" || /permission denied/i.test(message)) {
    return "Your session doesn't have permission to edit content — sign in again and retry.";
  }
  if (code === "PGRST202" || code === "42P01" || /admin_save_content|content_overrides/i.test(message)) {
    return "Content editing isn't set up yet — apply the latest database migration (20260727150000_content_overrides.sql) and try again.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONN|timeout/i.test(message)) {
    return "We couldn't reach the database. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/**
 * Persist a batch of copy overrides for one locale. A blank value clears the
 * override, so the shipped translation takes over again — that is how the
 * editor's per-field Reset is expressed.
 */
export async function saveContent(
  locale: string,
  entries: Record<string, string>
): Promise<SaveContentResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!(routing.locales as readonly string[]).includes(locale)) {
    return { ok: false, error: "Unknown locale." };
  }
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
    return { ok: false, error: "Nothing to save." };
  }

  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(entries)) {
    if (typeof value !== "string") continue;
    if (value.length > MAX_VALUE_LENGTH) {
      return { ok: false, error: `"${key}" is longer than ${MAX_VALUE_LENGTH} characters.` };
    }
    payload[key] = value;
  }
  if (Object.keys(payload).length === 0) return { ok: false, error: "Nothing to save." };

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_save_content", {
      p_locale: locale,
      p_entries: payload,
    });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    // Copy is read by every storefront route through the i18n request config.
    revalidatePath("/", "layout");
    revalidatePath("/admin/content");

    const result = (data ?? {}) as { saved?: number; cleared?: number };
    return { ok: true, saved: result.saved ?? 0, cleared: result.cleared ?? 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}
