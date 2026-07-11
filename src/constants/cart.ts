/** Cart pricing and shipping constants — the cart itself starts empty and
 * lives in the persisted client store (src/store/cart-store.ts). */

export const FREE_SHIPPING_THRESHOLD = 150;
export const FLAT_SHIPPING_RATE = 12;

export const shippingCountries = [
  "Morocco",
  "United States",
  "United Kingdom",
  "France",
  "United Arab Emirates",
] as const;
