export interface NavLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const siteConfig = {
  name: "Yasso Store",
  wordmark: "YASSO",
  description: "Premium e-commerce experience.",

  announcement: "Complimentary shipping on orders over $150",

  nav: [
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/collections" },
  ] satisfies NavLink[],

  popularSearches: ["Silk scarf", "Cashmere", "Leather tote", "Loafers", "Fragrance"],

  footer: {
    tagline: "Considered pieces in warm neutral tones — designed slowly, made to keep.",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "Shop all", href: "/shop" },
          { label: "Collections", href: "/collections" },
          { label: "Women", href: "/collections/women" },
          { label: "Men", href: "/collections/men" },
        ],
      },
    ] satisfies FooterColumn[],
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "X", href: "https://x.com" },
    ] satisfies NavLink[],
  },
} as const;
