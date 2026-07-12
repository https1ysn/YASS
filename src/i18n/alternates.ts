import { routing } from "./routing";

/**
 * Prefixes a locale-agnostic path with the given locale — for hrefs passed
 * into shared, locale-unaware primitives (Breadcrumb, Pagination's
 * createHref) that use plain next/link internally. `path` should start with
 * "/" or be "" for the home page.
 */
export function localeHref(locale: string, path: string): string {
  if (!path || path === "/") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Builds the `alternates.languages` map for a page's Metadata — one entry per
 * locale plus `x-default` (pointing at the default locale), so search engines
 * receive correct hreflang tags. `pathname` is the locale-agnostic path
 * (e.g. "/shop", "/products/silk-wrap-dress", "" for home).
 */
export function getLocaleAlternates(pathname: string): Record<string, string> {
  const suffix = pathname ? (pathname.startsWith("/") ? pathname : `/${pathname}`) : "";
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `/${locale}${suffix}`;
  }
  languages["x-default"] = `/${routing.defaultLocale}${suffix}`;
  return languages;
}
