"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/session";
import { adminProductSchema, type AdminProductInput } from "@/schemas/admin-product";
import { isProductStorageUrl, PRODUCTS_BUCKET, storagePathFromUrl } from "@/lib/supabase/storage";
import type { AdminProductImage } from "@/lib/supabase/admin";

export type AdminActionResult =
  { ok: true; id: string; slug: string } | { ok: false; error: string };

function friendlyError(message: string, code?: string): string {
  if (/admin_\w*product_image/i.test(message)) {
    return "Image management isn't fully set up yet — apply the latest database migration (20260710120000_product_images_admin.sql) and try again.";
  }
  if (code === "PGRST202" || /admin_(save|delete)_product/i.test(message)) {
    return "Products management isn't fully set up yet — apply the latest database migration (20260709150000_admin_products.sql) and try again.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONN|timeout/i.test(message)) {
    return "We couldn't reach the database. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/** Refresh the admin list and every catalog page that renders products. */
function revalidateCatalog() {
  revalidatePath("/", "layout");
}

/** Create (no id) or update (with id) a product via the admin RPC. */
export async function saveProduct(input: AdminProductInput): Promise<AdminActionResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  const parsed = adminProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }
  const data = parsed.data;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: result, error } = await supabase.rpc("admin_save_product", {
      p_id: data.id ?? null,
      p_name: data.name,
      p_slug: data.slug,
      p_description: data.description,
      p_category_id: data.categoryId,
      p_price: data.price,
      p_compare_at_price: data.compareAtPrice,
      p_availability: data.availability,
      p_badge: data.badge,
      p_colors: data.colors,
      p_sizes: data.sizes,
      p_is_featured: data.isFeatured,
    });

    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    const saved = result as { id?: string; slug?: string } | null;
    if (!saved?.id || !saved.slug) {
      return { ok: false, error: "The product could not be saved. Please try again." };
    }

    revalidateCatalog();
    return { ok: true, id: saved.id, slug: saved.slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function deleteProduct(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!UUID_RE.test(id)) {
    return { ok: false, error: "Invalid product id." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("admin_delete_product", { p_id: id });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    revalidateCatalog();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

/* -------------------------------------------------------- gallery management */

export type AdminImageActionResult = { ok: true } | { ok: false; error: string };

/** Best-effort storage cleanup — the DB row is already gone, so an orphaned
 * file is harmless and must never fail the action. Local placeholder images
 * (`/images/...`) are not storage files and are skipped. */
async function removeFromStorage(url: string | null | undefined) {
  const path = url ? storagePathFromUrl(url) : null;
  if (!path) return;
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.storage.from(PRODUCTS_BUCKET).remove([path]);
  } catch {
    // Ignore — see above.
  }
}

/** Registers an uploaded file as the last image of a product's gallery. */
export async function addProductImage(input: {
  productId: string;
  url: string;
  alt?: string;
}): Promise<{ ok: true; image: AdminProductImage } | { ok: false; error: string }> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!UUID_RE.test(input.productId)) {
    return { ok: false, error: "Invalid product id." };
  }
  if (!isProductStorageUrl(input.url)) {
    return { ok: false, error: "The image must be uploaded to the products bucket first." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_add_product_image", {
      p_product_id: input.productId,
      p_url: input.url,
      p_alt: input.alt ?? null,
    });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    const row = data as { id?: string; url?: string; sort_order?: number } | null;
    if (!row?.id || !row.url) {
      return { ok: false, error: "The image could not be saved. Please try again." };
    }

    revalidateCatalog();
    return {
      ok: true,
      image: { id: row.id, url: row.url, alt: input.alt ?? null, sortOrder: row.sort_order ?? 0 },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

/** Swaps the file behind a gallery entry and cleans up the previous file. */
export async function replaceProductImage(input: {
  id: string;
  url: string;
}): Promise<AdminImageActionResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!UUID_RE.test(input.id)) {
    return { ok: false, error: "Invalid image id." };
  }
  if (!isProductStorageUrl(input.url)) {
    return { ok: false, error: "The image must be uploaded to the products bucket first." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_replace_product_image", {
      p_id: input.id,
      p_url: input.url,
    });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    await removeFromStorage((data as { old_url?: string } | null)?.old_url);
    revalidateCatalog();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

/** Removes a gallery entry and its storage file. */
export async function deleteProductImage(id: string): Promise<AdminImageActionResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!UUID_RE.test(id)) {
    return { ok: false, error: "Invalid image id." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_delete_product_image", { p_id: id });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    await removeFromStorage((data as { url?: string } | null)?.url);
    revalidateCatalog();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}

/** Persists a full new gallery order — position 0 is the primary image. */
export async function reorderProductImages(input: {
  productId: string;
  imageIds: string[];
}): Promise<AdminImageActionResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!UUID_RE.test(input.productId) || input.imageIds.some((id) => !UUID_RE.test(id))) {
    return { ok: false, error: "Invalid image order." };
  }
  if (input.imageIds.length === 0) {
    return { ok: false, error: "The gallery is empty." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("admin_reorder_product_images", {
      p_product_id: input.productId,
      p_image_ids: input.imageIds,
    });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    revalidateCatalog();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}
