/**
 * The admin allow-list. Authentication proves who the user is; this list
 * decides who may enter the admin. Keep it in sync with the `is_admin()`
 * database function (supabase/migrations/20260710160000_admin_auth_hardening.sql),
 * which enforces the same list inside every admin RPC and storage policy.
 */
export const ADMIN_EMAILS = ["elbiadyassin25@gmail.com"] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && (ADMIN_EMAILS as readonly string[]).includes(email.trim().toLowerCase());
}
