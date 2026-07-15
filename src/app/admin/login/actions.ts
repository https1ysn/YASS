"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { adminLoginSchema, type AdminLoginInput } from "@/schemas/admin-auth";

export type AuthActionResult = { ok: true } | { ok: false; error: string };

function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "Incorrect email or password.";
  }
  if (/email not confirmed/i.test(message)) {
    return "This email hasn't been confirmed yet — confirm it in Supabase and try again.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONN|timeout/i.test(message)) {
    return "We couldn't reach the authentication service. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/**
 * Signs a user in. Any authenticated Supabase Auth user may access the admin —
 * there is no email allow-list, so access is governed by who has an account.
 */
export async function signInAdmin(input: AdminLoginInput): Promise<AuthActionResult> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check your details and try again.",
    };
  }

  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured — check your environment variables." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) return { ok: false, error: friendlyAuthError(error.message) };

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyAuthError(message) };
  }
}

/** Ends the current session. */
export async function signOutAdmin(): Promise<AuthActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return { ok: true };
  } catch {
    // Clearing the session cookie failed server-side — the client still
    // redirects to the login page, where the middleware re-validates.
    return { ok: false, error: "Sign-out failed. Please try again." };
  }
}
