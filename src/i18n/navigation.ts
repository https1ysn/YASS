import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation for storefront components. `Link`, `redirect`,
 * `useRouter` and `usePathname` here automatically prefix/parse the current
 * locale — use these instead of next/link and next/navigation anywhere under
 * src/app/[locale] or src/components/{home,layout,shop,product,cart,checkout}.
 *
 * Do NOT use these inside src/components/admin or src/app/admin — that tree
 * has no NextIntlClientProvider and calling these hooks there would throw.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
