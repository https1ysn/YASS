"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/session";
import { adminSizeSchema, type AdminSizeInput } from "@/schemas/admin-size";

export type SizeActionResult = { ok: true; id: string } | { ok: false; error: string };
export type SizeDeleteResult =
  | { ok: true; productsUsing: number }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

function friendlyError(message: string, code?: string): string {
  // 42501 is a *permission* failure, not a missing migration — telling an admin
  // whose session lapsed to re-run SQL would send them down the wrong path.
  if (code === "42501" || /permission denied/i.test(message)) {
    return "Your session doesn't have permission to manage sizes — sign in again and retry.";
  }
  if (code === "PGRST202" || code === "42P01" || /admin_(save|delete|reorder)_size/i.test(message)) {
    return "Sizes aren't set up yet — apply the latest database migration (20260727120000_sizes.sql) and try again.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONN|timeout/i.test(message)) {
    return "We couldn't reach the database. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/** Sizes feed the product form, so refresh the whole admin tree. */
function revalidateSizes() {
  revalidatePath("/admin/sizes");
  revalidatePath("/admin/products", "layout");
}

/** Create (no id) or update (with id) a size. */
export async function saveSize(input: AdminSizeInput): Promise<SizeActionResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  const parsed = adminSizeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }
  const data = parsed.data;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: result, error } = await supabase.rpc("admin_save_size", {
      p_id: data.id ?? null,
      p_name: data.name,
      p_sort_order: data.sortOrder,
      p_active: data.active,
    });

    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    const saved = result as { id?: string } | null;
    if (!saved?.id) return { ok: false, error: "The size could not be saved. Please try again." };

    revalidateSizes();
    return { ok: true, id: saved.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

/** Delete a size. Products keep any size name they already reference. */
export async function deleteSize(id: string): Promise<SizeDeleteResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid size id." };

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_delete_size", { p_id: id });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    revalidateSizes();
    return {
      ok: true,
      productsUsing: (data as { products_using?: number } | null)?.products_using ?? 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

/** Persist a whole drag-and-drop ordering — ids in their new display order. */
export async function reorderSizes(
  ids: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "No ordering was provided." };
  }
  if (!ids.every((id) => UUID_RE.test(id))) {
    return { ok: false, error: "Invalid size id in the ordering." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("admin_reorder_sizes", { p_ids: ids });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    revalidateSizes();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}
