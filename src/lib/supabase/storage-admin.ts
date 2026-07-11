import { createSupabaseServerClient } from "./server";
import { PRODUCTS_BUCKET, storagePathFromUrl } from "./storage";

/**
 * Server-side, best-effort storage cleanup for admin actions. The database
 * row is already updated when this runs, so an orphaned file is harmless and
 * must never fail the action. Local placeholder images (`/images/...`) are
 * not storage files and are skipped.
 */
export async function removeFromStorage(url: string | null | undefined) {
  const path = url ? storagePathFromUrl(url) : null;
  if (!path) return;
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.storage.from(PRODUCTS_BUCKET).remove([path]);
  } catch {
    // Ignore — see above.
  }
}
