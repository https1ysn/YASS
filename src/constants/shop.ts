import type { Collection, Product, ProductSpecification } from "@/types/product";

/**
 * Static placeholder catalog for the Shop / Collections experience.
 * Swap for real commerce data in a later phase.
 */

export const collections: Collection[] = [
  {
    slug: "women",
    name: "Women",
    description: "Ready-to-wear, shoes and accessories in warm neutral tones.",
    imageSrc: "/images/categories/women.jpg",
    pieceCount: 5,
  },
  {
    slug: "men",
    name: "Men",
    description: "Tailoring and refined essentials, cut to last.",
    imageSrc: "/images/categories/men.jpg",
    pieceCount: 4,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Leather goods, silk and jewelry — the quiet finish.",
    imageSrc: "/images/categories/accessories.jpg",
    pieceCount: 3,
  },
  {
    slug: "fragrance",
    name: "Fragrance",
    description: "Santal, amber and cedar — signature scents of the maison.",
    imageSrc: "/images/categories/fragrance.jpg",
    pieceCount: 1,
  },
  {
    slug: "summer-capsule",
    name: "Summer Capsule",
    description: "Effortless silhouettes for warmer days, in silk and linen.",
    imageSrc: "/images/instagram/i5.jpg",
    pieceCount: 3,
  },
  {
    slug: "atelier",
    name: "The Atelier Line",
    description: "Hand-finished, numbered pieces — arriving this autumn.",
    imageSrc: "/images/instagram/i4.jpg",
    pieceCount: 0,
    comingSoon: true,
  },
];

const baseProducts: Omit<Product, "rating" | "reviewCount">[] = [
  {
    slug: "silk-wrap-dress",
    name: "Silk Wrap Dress",
    href: "/products/silk-wrap-dress",
    imageSrc: "/images/products/p1.jpg",
    price: 420,
    category: "Women",
    badge: "New",
    description: "Fluid mulberry silk with a self-tie waist, cut for movement.",
    colors: ["sand", "chocolate"],
    sizes: ["XS", "S", "M", "L"],
    availability: "in-stock",
    collections: ["women", "summer-capsule"],
  },
  {
    slug: "pleated-midi-skirt",
    name: "Pleated Midi Skirt",
    href: "/products/pleated-midi-skirt",
    imageSrc: "/images/products/p7.jpg",
    price: 310,
    category: "Women",
    badge: "Best Seller",
    description: "Knife pleats in crepe de chine that catch light as you walk.",
    colors: ["camel", "noir"],
    sizes: ["XS", "S", "M", "L", "XL"],
    availability: "in-stock",
    collections: ["women"],
  },
  {
    slug: "cashmere-cardigan",
    name: "Cashmere Cardigan",
    href: "/products/cashmere-cardigan",
    imageSrc: "/images/products/p5.jpg",
    price: 480,
    category: "Women",
    description: "Grade-A Mongolian cashmere with corozo buttons.",
    colors: ["ivory", "sand"],
    sizes: ["S", "M", "L"],
    availability: "made-to-order",
    collections: ["women"],
  },
  {
    slug: "linen-shirt-dress",
    name: "Linen Shirt Dress",
    href: "/products/linen-shirt-dress",
    imageSrc: "/images/products/p3.jpg",
    price: 290,
    compareAtPrice: 360,
    category: "Women",
    description: "Washed European linen, relaxed through the body.",
    colors: ["ivory", "camel"],
    sizes: ["XS", "S", "M", "L"],
    availability: "in-stock",
    collections: ["women", "summer-capsule"],
  },
  {
    slug: "silk-camisole",
    name: "Silk Camisole",
    href: "/products/silk-camisole",
    imageSrc: "/images/products/p6.jpg",
    price: 180,
    category: "Women",
    description: "Bias-cut sandwashed silk with adjustable straps.",
    colors: ["ivory", "noir"],
    sizes: ["XS", "S", "M", "L"],
    availability: "in-stock",
    collections: ["women", "summer-capsule"],
  },
  {
    slug: "cashmere-crewneck",
    name: "Cashmere Crewneck",
    href: "/products/cashmere-crewneck",
    imageSrc: "/images/products/p2.jpg",
    price: 340,
    category: "Men",
    description: "Twelve-gauge knit with saddle shoulders and ribbed trims.",
    colors: ["chocolate", "noir", "sand"],
    sizes: ["S", "M", "L", "XL"],
    availability: "in-stock",
    collections: ["men"],
  },
  {
    slug: "wool-overcoat",
    name: "Wool Overcoat",
    href: "/products/wool-overcoat",
    imageSrc: "/images/products/p4.jpg",
    price: 890,
    category: "Men",
    badge: "Best Seller",
    description: "Double-faced Italian wool, half-canvassed and unlined.",
    colors: ["camel", "noir"],
    sizes: ["S", "M", "L", "XL"],
    availability: "made-to-order",
    collections: ["men"],
  },
  {
    slug: "oxford-shirt",
    name: "Oxford Shirt",
    href: "/products/oxford-shirt",
    imageSrc: "/images/products/p8.jpg",
    price: 165,
    category: "Men",
    description: "Garment-washed oxford cotton with mother-of-pearl buttons.",
    colors: ["ivory", "sand"],
    sizes: ["S", "M", "L", "XL"],
    availability: "in-stock",
    collections: ["men"],
  },
  {
    slug: "suede-loafers",
    name: "Suede Loafers",
    href: "/products/suede-loafers",
    imageSrc: "/images/products/p8.jpg",
    price: 450,
    category: "Men",
    description: "Unstructured calf suede on a hand-stitched leather sole.",
    colors: ["chocolate", "camel"],
    sizes: ["40", "41", "42", "43", "44"],
    availability: "in-stock",
    collections: ["men"],
  },
  {
    slug: "leather-tote",
    name: "Leather Tote",
    href: "/products/leather-tote",
    imageSrc: "/images/products/p3.jpg",
    price: 580,
    compareAtPrice: 690,
    category: "Accessories",
    description: "Vegetable-tanned leather that deepens with every year.",
    colors: ["chocolate", "noir"],
    sizes: ["One size"],
    availability: "in-stock",
    collections: ["accessories"],
  },
  {
    slug: "silk-scarf-dune",
    name: "Silk Scarf — Dune",
    href: "/products/silk-scarf-dune",
    imageSrc: "/images/products/p6.jpg",
    price: 160,
    category: "Accessories",
    badge: "Best Seller",
    description: "Hand-rolled twill silk in the maison's dune print.",
    colors: ["sand", "camel"],
    sizes: ["One size"],
    availability: "in-stock",
    collections: ["accessories"],
  },
  {
    slug: "gold-signet-ring",
    name: "Gold Signet Ring",
    href: "/products/gold-signet-ring",
    imageSrc: "/images/products/p1.jpg",
    price: 620,
    category: "Accessories",
    description: "Recycled 18k gold, polished by hand in our atelier.",
    colors: ["camel"],
    sizes: ["6", "7", "8"],
    availability: "made-to-order",
    collections: ["accessories"],
  },
  {
    slug: "santal-parfum",
    name: "Santal Eau de Parfum",
    href: "/products/santal-parfum",
    imageSrc: "/images/products/p4.jpg",
    price: 185,
    category: "Fragrance",
    badge: "New",
    description: "Australian sandalwood, amber and a trace of sea salt.",
    colors: ["noir"],
    sizes: ["50ml", "100ml"],
    availability: "in-stock",
    collections: ["fragrance"],
  },
];

/** Deterministic placeholder ratings so every product page looks lived-in. */
export const shopProducts: Product[] = baseProducts.map((product, index) => ({
  ...product,
  rating: [4.9, 4.7, 4.8, 4.6][index % 4],
  reviewCount: 9 + ((index * 13) % 40),
}));

/* --------------------------- Product page content ------------------------ */

const galleryPool = [
  "/images/products/p1.jpg",
  "/images/products/p2.jpg",
  "/images/products/p3.jpg",
  "/images/products/p4.jpg",
  "/images/products/p5.jpg",
  "/images/products/p6.jpg",
  "/images/products/p7.jpg",
  "/images/products/p8.jpg",
];

/** Four placeholder views per product, starting from its main image. */
export function getProductGallery(product: Product): string[] {
  const start = Math.max(0, galleryPool.indexOf(product.imageSrc));
  return [0, 1, 2, 3].map((offset) => galleryPool[(start + offset) % galleryPool.length]);
}

const materialByCategory: Record<string, string> = {
  Women: "Certified mulberry silk & cashmere",
  Men: "Italian wool & organic cotton",
  Accessories: "Vegetable-tanned leather & twill silk",
  Fragrance: "Natural essences, 20% concentration",
};

export function getProductSpecifications(product: Product): ProductSpecification[] {
  return [
    {
      label: "Material",
      value: materialByCategory[product.category] ?? "Certified natural fibers",
    },
    { label: "Origin", value: "Made in Portugal" },
    {
      label: "Availability",
      value: product.availability === "in-stock" ? "In stock" : "Made to order",
    },
    { label: "Reference", value: `YS-${product.slug.slice(0, 12).toUpperCase()}` },
  ];
}

export const shippingReturns = [
  "Complimentary carbon-neutral shipping on orders over $150.",
  "Express delivery available at checkout — 2 to 3 working days.",
  "30-day returns, collected from your door at no cost.",
  "Every piece arrives in our signature recycled packaging.",
];

export const careInstructions = [
  "Dry clean only, with a specialist you trust.",
  "Store folded in the provided cotton pouch, away from direct light.",
  "Steam gently — never iron directly on the surface.",
  "Repairs and refresh services are complimentary for life.",
];

/* ------------------------------ Filter options --------------------------- */

export const filterCategories = [
  { value: "women", label: "Women", count: 5 },
  { value: "men", label: "Men", count: 4 },
  { value: "accessories", label: "Accessories", count: 3 },
  { value: "fragrance", label: "Fragrance", count: 1 },
] as const;

export const filterColors = [
  { value: "noir", label: "Noir", hex: "#111111" },
  { value: "chocolate", label: "Chocolate", hex: "#6F5137" },
  { value: "camel", label: "Camel", hex: "#AD7D56" },
  { value: "sand", label: "Sand", hex: "#CDB49E" },
  { value: "ivory", label: "Ivory", hex: "#F4EFE8" },
] as const;

export const filterSizes = ["XS", "S", "M", "L", "XL", "One size"] as const;

export const filterAvailability = [
  { value: "in-stock", label: "In stock", count: 9 },
  { value: "made-to-order", label: "Made to order", count: 4 },
] as const;

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
] as const;
