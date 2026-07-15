import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server-side session helpers. Sessions are validated with
 * `supabase.auth.getUser()` (verified against the auth server) — client
 * state is never trusted.
 *
 * There is no email allow-list: any authenticated Supabase Auth user is an
 * admin. Access is controlled entirely by who has a Supabase account, so keep
 * public sign-ups disabled in the Supabase dashboard.
 */

export interface AdminUser {
  id: string;
  email: string;
}

/** The signed-in user, or null when there is no valid session. */
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

/** The admin user — any authenticated Supabase Auth user qualifies. */
export async function getAdminUser(): Promise<AdminUser | null> {
  return getSessionUser();
}

/**
 * Gate for server actions: returns a friendly error message when the caller
 * is not authenticated, or null when the action may proceed.
 */
export async function requireAdminAction(): Promise<string | null> {
  const user = await getSessionUser();
  if (!user) return "Your session has expired — sign in and try again.";
  return null;
}
