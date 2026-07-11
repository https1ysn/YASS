"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/session";
import { isProductStorageUrl } from "@/lib/supabase/storage";
import { removeFromStorage } from "@/lib/supabase/storage-admin";
import { adminCategorySchema, type AdminCategoryInput } from "@/schemas/admin-category";

export type AdminCategoryActionResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

function friendlyError(message: string, code?: string): string {
  if (code === "PGRST202" || /admin_(save|delete)_category/i.test(message)) {
    return "Categories management isn't fully set up yet — apply the latest database migration (20260710140000_admin_categories.sql) and try again.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONN|timeout/i.test(message)) {
    return "We couldn't reach the database. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/** Refresh the admin list and every catalog page that renders categories. */
function revalidateCatalog() {
  revalidatePath("/", "layout");
}

/** Create (no id) or update (with id) a category via the admin RPC. */
export async function saveCategory(input: AdminCategoryInput): Promise<AdminCategoryActionResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  const parsed = adminCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }
  const data = parsed.data;

  // Only accept imagery from our own bucket or the app's local placeholders.
  if (data.imageUrl && !isProductStorageUrl(data.imageUrl) && !data.imageUrl.startsWith("/images/")) {
    return { ok: false, error: "The image must be uploaded to the products bucket first." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: result, error } = await supabase.rpc("admin_save_category", {
      p_id: data.id ?? null,
      p_name: data.name,
      p_slug: data.slug,
      p_description: data.description,
      p_image_url: data.imageUrl,
      p_sort_order: data.sortOrder,
      p_is_coming_soon: data.isComingSoon,
    });

    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    const saved = result as { id?: string; slug?: string; old_image_url?: string | null } | null;
    if (!saved?.id || !saved.slug) {
      return { ok: false, error: "The category could not be saved. Please try again." };
    }

    // A replaced or removed image leaves its old file behind — clean it up.
    if (saved.old_image_url && saved.old_image_url !== data.imageUrl) {
      await removeFromStorage(saved.old_image_url);
    }

    revalidateCatalog();
    return { ok: true, id: saved.id, slug: saved.slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

export async function deleteCategory(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!UUID_RE.test(id)) {
    return { ok: false, error: "Invalid category id." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_delete_category", { p_id: id });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    await removeFromStorage((data as { image_url?: string | null } | null)?.image_url);
    revalidateCatalog();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}
