/**
 * Static placeholder checkout content — UI only until a real checkout exists.
 * Labels/descriptions live in messages/*.json under shippingMethods.{id} and
 * paymentMethods.{id} — components look them up by id.
 */

export interface ShippingMethod {
  id: string;
  /** Flat price; 0 renders as "Complimentary". */
  price: number;
}

export interface PaymentMethod {
  id: string;
  available: boolean;
}

export const shippingMethods: ShippingMethod[] = [
  { id: "standard", price: 0 },
  { id: "express", price: 24 },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "cod", available: true },
  { id: "card", available: false },
  { id: "paypal", available: false },
];

export const FAKE_ORDER_NUMBER = "YS-2026-04812";
// The demo delivery-estimate fallback moved to messages/*.json
// (checkout.confirmation) — see order-confirmation.tsx.
