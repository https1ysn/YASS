"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";

/**
 * Browser Supabase client — for Client Components.
 * Returns a singleton under the hood (createBrowserClient memoizes).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
