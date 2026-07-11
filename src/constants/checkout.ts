/**
 * Static placeholder checkout content — UI only until a real checkout exists.
 */

export interface ShippingMethod {
  id: string;
  label: string;
  description: string;
  /** Flat price; 0 renders as "Complimentary". */
  price: number;
}

export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  available: boolean;
}

export const shippingMethods: ShippingMethod[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "2–4 working days, carbon-neutral",
    price: 0,
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "1–2 working days, signature on arrival",
    price: 24,
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives at your door.",
    available: true,
  },
  {
    id: "card",
    label: "Credit Card",
    description: "Coming soon",
    available: false,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Coming soon",
    available: false,
  },
];

export const FAKE_ORDER_NUMBER = "YS-2026-04812";
export const ESTIMATED_DELIVERY = "2–4 working days";
