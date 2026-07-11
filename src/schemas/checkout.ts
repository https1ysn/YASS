import { z } from "zod";

/** Validation for the place-order payload — shared by the server action. */
export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
  phone: z.string().trim().min(6, "Please enter a valid phone number.").max(30),
  email: z
    .union([z.string().trim().email("Please enter a valid email address."), z.literal("")])
    .optional(),
  country: z.string().trim().min(2, "Please choose a country.").max(80),
  city: z.string().trim().min(2, "Please enter your city.").max(120),
  street: z.string().trim().min(4, "Please enter your street address.").max(240),
  postalCode: z.string().trim().max(20).optional(),
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["cod"], {
    message: "Only cash on delivery is available for now.",
  }),
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
    .min(1, "Your bag is empty."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
