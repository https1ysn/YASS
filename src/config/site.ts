/** Structural site config — hrefs and stable keys only. Every display label
 * lives in messages/*.json (nav.*, footer.*, announcement, search.*) so the
 * storefront never hardcodes translations here. Used by both the storefront
 * and the admin (wordmark/name are brand constants, never translated). */

export interface NavLink {
  key: string;
  href: string;
}

export interface FooterColumn {
  titleKey: string;
  links: NavLink[];
}

export const siteConfig = {
  name: "Yasso Store",
  wordmark: "YASSO",

  nav: [
    { key: "shop", href: "/shop" },
    { key: "collections", href: "/collections" },
  ] satisfies NavLink[],

  footer: {
    columns: [
      {
        titleKey: "shopColumnTitle",
        links: [
          { key: "shopAll", href: "/shop" },
          { key: "collections", href: "/collections" },
        ],
      },
    ] satisfies FooterColumn[],
    // Platform names are universal — kept as literal labels, not translated.
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "X", href: "https://x.com" },
    ],
  },
} as const;
