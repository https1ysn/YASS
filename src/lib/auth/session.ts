import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "./admins";

/**
 * Server-side session helpers. Sessions are validated with
 * `supabase.auth.getUser()` (verified against the auth server) — client
 * state is never trusted.
 */

export interface AdminUser {
  id: string;
  email: string;
}

/** The signed-in user, whether or not they are an admin. */
export async function getSessionUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return null;
    return { id: data.user.id, email: data.user.email };
  } catch {
    return null;
  }
}

/** The signed-in user, only when they are on the admin allow-list. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getSessionUser();
  return user && isAdminEmail(user.email) ? user : null;
}

/**
 * Gate for server actions: returns a friendly error message when the caller
 * is not an authenticated admin, or null when the action may proceed.
 */
export async function requireAdminAction(): Promise<string | null> {
  const user = await getSessionUser();
  if (!user) return "Your session has expired — sign in and try again.";
  if (!isAdminEmail(user.email)) return "Unauthorized — this account has no admin access.";
  return null;
}
