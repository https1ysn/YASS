import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/config";
import { routing } from "@/i18n/routing";

/**
 * Guards every /admin route. Sessions are validated server-side with
 * `auth.getUser()` (never trusting client state) and refreshed cookies are
 * carried on every response — including redirects — so there is no flicker
 * and no logged-out flash after token rotation. Any authenticated Supabase
 * user may enter (no email allow-list). The admin dashboard stays
 * English-only and outside the locale routing below.
 */
async function adminAuthMiddleware(request: NextRequest) {
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

  const path = request.nextUrl.pathname;

  function redirectTo(pathname: string) {
    const redirected = NextResponse.redirect(new URL(pathname, request.url));
    // Keep refreshed auth cookies on the redirect.
    response.cookies.getAll().forEach((cookie) => redirected.cookies.set(cookie));
    return redirected;
  }

  // Already-authenticated users skip the login page.
  if (path === "/admin/login") {
    if (user) return redirectTo("/admin");
    return response;
  }

  // Every other /admin route requires an authenticated Supabase user.
  if (!user) return redirectTo("/admin/login");
  return response;
}

/** Locale detection/redirect/rewrite for the storefront — French default. */
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminAuthMiddleware(request);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    // Storefront: every path except Next internals, API routes, and files with an extension.
    "/((?!api|_next|_vercel|admin|.*\\..*).*)",
  ],
};
