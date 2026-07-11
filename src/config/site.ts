export interface NavLink {
  label: string;
  href: string;
}

export interface MegaMenuColumn {
  title: string;
  links: NavLink[];
}

export interface MegaMenuFeatured {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  megaMenu?: {
    columns: MegaMenuColumn[];
    featured: MegaMenuFeatured;
  };
}

export const siteConfig = {
  name: "Yasso Store",
  wordmark: "YASSO",
  description: "Premium e-commerce experience.",

  announcement: "Complimentary shipping on orders over $150",

  nav: [
    {
      label: "Women",
      href: "/collections/women",
      megaMenu: {
        columns: [
          {
            title: "Ready-to-Wear",
            links: [
              { label: "New Arrivals", href: "/collections/women/new" },
              { label: "Dresses", href: "/collections/women/dresses" },
              { label: "Knitwear", href: "/collections/women/knitwear" },
              { label: "Outerwear", href: "/collections/women/outerwear" },
              { label: "Tailoring", href: "/collections/women/tailoring" },
            ],
          },
          {
            title: "Shoes & Bags",
            links: [
              { label: "Heels", href: "/collections/women/heels" },
              { label: "Flats", href: "/collections/women/flats" },
              { label: "Handbags", href: "/collections/women/handbags" },
              { label: "Totes", href: "/collections/women/totes" },
            ],
          },
          {
            title: "Accessories",
            links: [
              { label: "Jewelry", href: "/collections/women/jewelry" },
              { label: "Silk Scarves", href: "/collections/women/scarves" },
              { label: "Sunglasses", href: "/collections/women/sunglasses" },
              { label: "Belts", href: "/collections/women/belts" },
            ],
          },
        ],
        featured: {
          eyebrow: "The Edit",
          title: "Summer Capsule",
          description: "Effortless silhouettes in warm neutral tones.",
          cta: "Discover the collection",
          href: "/collections/summer-capsule",
        },
      },
    },
    {
      label: "Men",
      href: "/collections/men",
      megaMenu: {
        columns: [
          {
            title: "Ready-to-Wear",
            links: [
              { label: "New Arrivals", href: "/collections/men/new" },
              { label: "Shirts", href: "/collections/men/shirts" },
              { label: "Knitwear", href: "/collections/men/knitwear" },
              { label: "Outerwear", href: "/collections/men/outerwear" },
              { label: "Trousers", href: "/collections/men/trousers" },
            ],
          },
          {
            title: "Shoes",
            links: [
              { label: "Sneakers", href: "/collections/men/sneakers" },
              { label: "Loafers", href: "/collections/men/loafers" },
              { label: "Boots", href: "/collections/men/boots" },
            ],
          },
          {
            title: "Accessories",
            links: [
              { label: "Watches", href: "/collections/men/watches" },
              { label: "Leather Goods", href: "/collections/men/leather-goods" },
              { label: "Sunglasses", href: "/collections/men/sunglasses" },
              { label: "Fragrance", href: "/collections/men/fragrance" },
            ],
          },
        ],
        featured: {
          eyebrow: "Signature",
          title: "The Atelier Line",
          description: "Hand-finished essentials, crafted to last.",
          cta: "Explore the line",
          href: "/collections/atelier",
        },
      },
    },
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/collections" },
    { label: "Journal", href: "/journal" },
    { label: "About", href: "/about" },
  ] satisfies NavItem[],

  popularSearches: ["Silk scarf", "Cashmere", "Leather tote", "Loafers", "Fragrance"],

  accountLinks: [
    { label: "Sign in", href: "/account/login" },
    { label: "Create account", href: "/account/register" },
    { label: "Orders", href: "/account/orders" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Settings", href: "/account/settings" },
  ] satisfies NavLink[],

  footer: {
    tagline: "Considered pieces in warm neutral tones — designed slowly, made to keep.",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "Women", href: "/collections/women" },
          { label: "Men", href: "/collections/men" },
          { label: "Collections", href: "/collections" },
          { label: "New Arrivals", href: "/collections/new" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Journal", href: "/journal" },
          { label: "Stores", href: "/stores" },
          { label: "Careers", href: "/careers" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Contact", href: "/contact" },
          { label: "Shipping & Returns", href: "/shipping" },
          { label: "Size Guide", href: "/size-guide" },
          { label: "FAQ", href: "/faq" },
        ],
      },
    ] satisfies MegaMenuColumn[],
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "X", href: "https://x.com" },
    ] satisfies NavLink[],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ] satisfies NavLink[],
  },
} as const;
