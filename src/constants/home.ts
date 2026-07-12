/**
 * Static placeholder content for the homepage.
 * Swap for real data (CMS / commerce backend) in a later phase.
 */

export interface PlaceholderProduct {
  name: string;
  href: string;
  imageSrc: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  badge?: string;
}

export const featuredCategories = [
  {
    name: "Women",
    href: "/collections/women",
    imageSrc: "/images/categories/women.jpg",
    description: "Ready-to-wear & atelier pieces",
  },
  {
    name: "Men",
    href: "/collections/men",
    imageSrc: "/images/categories/men.jpg",
    description: "Tailoring & refined essentials",
  },
  {
    name: "Accessories",
    href: "/collections/accessories",
    imageSrc: "/images/categories/accessories.jpg",
    description: "Leather goods & jewelry",
  },
  {
    name: "Fragrance",
    href: "/collections/fragrance",
    imageSrc: "/images/categories/fragrance.jpg",
    description: "Signature scents of the maison",
  },
] as const;

export const featuredProducts: PlaceholderProduct[] = [
  {
    name: "Silk Wrap Dress",
    href: "/products/silk-wrap-dress",
    imageSrc: "/images/products/p1.jpg",
    price: 420,
    category: "Women",
    badge: "New",
  },
  {
    name: "Cashmere Crewneck",
    href: "/products/cashmere-crewneck",
    imageSrc: "/images/products/p2.jpg",
    price: 340,
    category: "Men",
  },
  {
    name: "Leather Tote",
    href: "/products/leather-tote",
    imageSrc: "/images/products/p3.jpg",
    price: 580,
    compareAtPrice: 690,
    category: "Accessories",
  },
  {
    name: "Santal Eau de Parfum",
    href: "/products/santal-parfum",
    imageSrc: "/images/products/p4.jpg",
    price: 185,
    category: "Fragrance",
    badge: "New",
  },
];

export const bestSellers: PlaceholderProduct[] = [
  {
    name: "Wool Overcoat",
    href: "/products/wool-overcoat",
    imageSrc: "/images/products/p5.jpg",
    price: 890,
    category: "Men",
    badge: "Best Seller",
  },
  {
    name: "Silk Scarf — Dune",
    href: "/products/silk-scarf-dune",
    imageSrc: "/images/products/p6.jpg",
    price: 160,
    category: "Accessories",
    badge: "Best Seller",
  },
  {
    name: "Pleated Midi Skirt",
    href: "/products/pleated-midi-skirt",
    imageSrc: "/images/products/p7.jpg",
    price: 310,
    category: "Women",
    badge: "Best Seller",
  },
  {
    name: "Suede Loafers",
    href: "/products/suede-loafers",
    imageSrc: "/images/products/p8.jpg",
    price: 450,
    category: "Men",
    badge: "Best Seller",
  },
];

// brandStats/benefits/testimonials/instagramPosts text lives in
// messages/*.json (home_brandStats, home_benefits, home_testimonials,
// home_instagramAlts) — these arrays keep only the stable/numeric fields;
// components pair them up by index with the translated text via t.raw().

export const brandStats = [{ value: "1998" }, { value: "3" }, { value: "100%" }] as const;

export const benefits = [{ icon: "shipping" }, { icon: "returns" }, { icon: "craft" }, { icon: "care" }] as const;

export const testimonials = [
  { name: "Amelia R.", location: "Paris", rating: 5 },
  { name: "Karim B.", location: "Dubai", rating: 5 },
  { name: "Sofia M.", location: "Milan", rating: 5 },
] as const;

export const instagramPosts = [
  { imageSrc: "/images/instagram/i1.jpg" },
  { imageSrc: "/images/instagram/i2.jpg" },
  { imageSrc: "/images/instagram/i3.jpg" },
  { imageSrc: "/images/instagram/i4.jpg" },
  { imageSrc: "/images/instagram/i5.jpg" },
  { imageSrc: "/images/instagram/i6.jpg" },
] as const;

export const instagramHandle = "@yasso.maison";
