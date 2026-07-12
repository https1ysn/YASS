import { z } from "zod";

type Translator = (key: string) => string;

/** Validation for the place-order payload — shared by the server action.
 * Built from a translator so error messages match the shopper's locale;
 * `checkoutSchema` is a plain-English default for type inference and as a
 * defense-in-depth fallback. */
export function createCheckoutSchema(t: Translator) {
  return z.object({
    fullName: z.string().trim().min(2, t("fullName")).max(120),
    phone: z.string().trim().min(6, t("phone")).max(30),
    email: z.union([z.string().trim().email(t("email")), z.literal("")]).optional(),
    country: z.string().trim().min(2, t("country")).max(80),
    city: z.string().trim().min(2, t("city")).max(120),
    street: z.string().trim().min(4, t("street")).max(240),
    postalCode: z.string().trim().max(20).optional(),
    shippingMethod: z.enum(["standard", "express"]),
    paymentMethod: z.enum(["cod"], { message: t("paymentMethod") }),
    notes: z.string().trim().max(1000).optional(),
    coupon: z.string().trim().max(40).nullable().optional(),
    items: z
      .array(
        z.object({
          slug: z.string().min(1),
          size: z.string().min(1),
          color: z.string(),
          quantity: z.number().int().min(1).max(9),
        })
      )
      .min(1, t("emptyBag")),
  });
}

const defaultT: Translator = (key) =>
  ({
    fullName: "Please enter your full name.",
    phone: "Please enter a valid phone number.",
    email: "Please enter a valid email address.",
    country: "Please choose a country.",
    city: "Please enter your city.",
    street: "Please enter your street address.",
    paymentMethod: "Only cash on delivery is available for now.",
    emptyBag: "Your bag is empty.",
  })[key] ?? key;

export const checkoutSchema = createCheckoutSchema(defaultT);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
