import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/config";
import { isAdminEmail } from "@/lib/auth/admins";

/**
 * Guards every /admin route. Sessions are validated server-side with
 * `auth.getUser()` (never trusting client state) and refreshed cookies are
 * carried on every response — including redirects — so there is no flicker
 * and no logged-out flash after token rotation.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Without Supabase there is no auth to enforce; the admin pages themselves
  // already explain the missing configuration.
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? null;
  const isAdmin = isAdminEmail(email);
  const path = request.nextUrl.pathname;

  function redirectTo(pathname: string) {
    const redirected = NextResponse.redirect(new URL(pathname, request.url));
    // Keep refreshed auth cookies on the redirect.
    response.cookies.getAll().forEach((cookie) => redirected.cookies.set(cookie));
    return redirected;
  }

  if (path === "/admin/login") {
    if (isAdmin) return redirectTo("/admin");
    return response;
  }

  if (path === "/admin/unauthorized") {
    if (!user) return redirectTo("/admin/login");
    if (isAdmin) return redirectTo("/admin");
    return response;
  }

  if (!user) return redirectTo("/admin/login");
  if (!isAdmin) return redirectTo("/admin/unauthorized");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
