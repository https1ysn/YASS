/** Cart pricing and shipping constants — the cart itself starts empty and
 * lives in the persisted client store (src/store/cart-store.ts). */

export const FREE_SHIPPING_THRESHOLD = 150;
export const FLAT_SHIPPING_RATE = 12;

/** Country names live in messages/*.json under countries.{key} — components
 * look them up by key and use `name` as the value actually submitted. */
export const shippingCountries = [
  { key: "morocco", name: "Morocco" },
  { key: "unitedStates", name: "United States" },
  { key: "unitedKingdom", name: "United Kingdom" },
  { key: "france", name: "France" },
  { key: "unitedArabEmirates", name: "United Arab Emirates" },
] as const;
