import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";

/**
 * Helpers for the public "products" storage bucket. Uploads run in the
 * browser over XHR (supabase-js exposes no upload-progress events); URL
 * helpers are shared with the server actions that clean files up.
 */

export const PRODUCTS_BUCKET = "products";

function publicPrefix() {
  return `${supabaseUrl}/storage/v1/object/public/${PRODUCTS_BUCKET}/`;
}

/** True when the URL points at a file inside this project's products bucket. */
export function isProductStorageUrl(url: string): boolean {
  return isSupabaseConfigured && url.startsWith(publicPrefix());
}

/** Bucket-relative path for a public URL, or null for external/local images. */
export function storagePathFromUrl(url: string): string | null {
  if (!isProductStorageUrl(url)) return null;
  const path = url.slice(publicPrefix().length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

function uniqueFileName(file: File): string {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const random = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${random}.${ext}`;
}

/** Unique, collision-safe path for a new product image file. */
export function productImagePath(productId: string, file: File): string {
  return `${productId}/${uniqueFileName(file)}`;
}

/** Unique, collision-safe path for a category image file. */
export function categoryImagePath(file: File): string {
  return `categories/${uniqueFileName(file)}`;
}

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const ACCEPTED_IMAGE_ATTR = ACCEPTED_IMAGE_TYPES.join(",");
export const MAX_IMAGE_SIZE_MB = 5;

/** Returns an error message for unusable image files, or null when valid. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Use a JPEG, PNG, WebP or AVIF image.";
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Keep images under ${MAX_IMAGE_SIZE_MB} MB.`;
  }
  return null;
}

/**
 * Browser-only: uploads a file to the products bucket, reporting progress as
 * 0–100. Resolves with the public URL of the stored file. Sends the signed-in
 * admin's access token — the bucket's write policies are admin-only.
 */
export async function uploadProductImage(
  file: File,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured — check your environment variables.");
  }

  // Dynamic import keeps this module importable from server actions.
  const { createSupabaseBrowserClient } = await import("./client");
  const { data } = await createSupabaseBrowserClient().auth.getSession();
  const accessToken = data.session?.access_token ?? supabaseKey;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${PRODUCTS_BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", supabaseKey);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "3600");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(`${publicPrefix()}${path}`);
        return;
      }
      let message = `Upload failed (${xhr.status}).`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = body.message || body.error || message;
      } catch {
        // Non-JSON error body — keep the status message.
      }
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection."));
    xhr.send(file);
  });
}
