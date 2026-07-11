import type { CartLine } from "@/types/cart";
import { shopProducts } from "./shop";

/**
 * Static placeholder cart contents. Swap for a real cart store in a later phase.
 */

function productBySlug(slug: string) {
  const product = shopProducts.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown demo product: ${slug}`);
  return product;
}

export const demoCartLines: CartLine[] = [
  {
    id: "silk-wrap-dress--M--sand",
    product: productBySlug("silk-wrap-dress"),
    quantity: 1,
    size: "M",
    color: "sand",
  },
  {
    id: "cashmere-crewneck--L--chocolate",
    product: productBySlug("cashmere-crewneck"),
    quantity: 2,
    size: "L",
    color: "chocolate",
  },
  {
    id: "leather-tote--One size--noir",
    product: productBySlug("leather-tote"),
    quantity: 1,
    size: "One size",
    color: "noir",
  },
];

export const demoSavedLines: CartLine[] = [
  {
    id: "suede-loafers--42--camel",
    product: productBySlug("suede-loafers"),
    quantity: 1,
    size: "42",
    color: "camel",
  },
];

export const FREE_SHIPPING_THRESHOLD = 150;
export const FLAT_SHIPPING_RATE = 12;

export const shippingCountries = [
  "Morocco",
  "United States",
  "United Kingdom",
  "France",
  "United Arab Emirates",
] as const;
