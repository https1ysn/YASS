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

export const brandStats = [
  { value: "1998", label: "Maison founded" },
  { value: "3", label: "Ateliers worldwide" },
  { value: "100%", label: "Responsibly sourced" },
] as const;

export const benefits = [
  {
    icon: "shipping",
    title: "Complimentary Shipping",
    description: "Free carbon-neutral delivery on all orders over $150, worldwide.",
  },
  {
    icon: "returns",
    title: "Effortless Returns",
    description: "30 days to reconsider — collection arranged from your door.",
  },
  {
    icon: "craft",
    title: "Atelier Craftsmanship",
    description: "Every piece hand-finished in our ateliers with certified materials.",
  },
  {
    icon: "care",
    title: "Lifetime Care",
    description: "Repairs and refresh services for the life of your piece.",
  },
] as const;

export const testimonials = [
  {
    quote:
      "The attention to detail is extraordinary. My coat arrived wrapped like a gift and fits like it was made for me.",
    name: "Amelia R.",
    location: "Paris",
    rating: 5,
  },
  {
    quote:
      "Quiet luxury done right — no logos, just impeccable fabric and cut. I keep coming back every season.",
    name: "Karim B.",
    location: "Dubai",
    rating: 5,
  },
  {
    quote:
      "Their lifetime care service restored my five-year-old tote to new. This is what buying well means.",
    name: "Sofia M.",
    location: "Milan",
    rating: 5,
  },
] as const;

export const instagramPosts = [
  { imageSrc: "/images/instagram/i1.jpg", alt: "Atelier detail — silk in dune tones" },
  { imageSrc: "/images/instagram/i2.jpg", alt: "Campaign — warm neutral wardrobe" },
  { imageSrc: "/images/instagram/i3.jpg", alt: "Studio still life — leather goods" },
  { imageSrc: "/images/instagram/i4.jpg", alt: "Behind the seams — hand stitching" },
  { imageSrc: "/images/instagram/i5.jpg", alt: "The summer capsule, on location" },
  { imageSrc: "/images/instagram/i6.jpg", alt: "Fragrance — santal and amber" },
] as const;

export const instagramHandle = "@yasso.maison";
