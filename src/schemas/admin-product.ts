import { z } from "zod";
import { filterColors } from "@/constants/shop";

export const HEX_COLOR_RE = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Colors saved before the free color picker existed are named tokens
 * ("sand", "noir", …) — they stay valid so existing products keep saving. */
const legacyColorValues = new Set<string>(filterColors.map((color) => color.value));

/** Validation for the admin product form — shared by client and server action. */
export const adminProductSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2, "Please enter a product name.").max(140),
    slug: z
      .string()
      .trim()
      .min(2, "Please enter a slug.")
      .max(140)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Lowercase letters, numbers and hyphens only (e.g. silk-wrap-dress)."
      ),
    description: z.string().trim().max(2000, "Keep the description under 2000 characters."),
    categoryId: z.string().uuid("Choose a category."),
    price: z
      .number({ message: "Enter a valid price." })
      .min(0, "The price can't be negative.")
      .max(1000000),
    compareAtPrice: z
      .number({ message: "Enter a valid compare-at price." })
      .min(0)
      .max(1000000)
      .nullable(),
    availability: z.enum(["in-stock", "made-to-order"]),
    badge: z.enum(["New", "Best Seller", "Sale"]).nullable(),
    colors: z
      .array(
        z
          .string()
          .trim()
          .refine((value) => HEX_COLOR_RE.test(value) || legacyColorValues.has(value), {
            message: "Colors must be valid HEX values (e.g. #AD7D56).",
          })
      )
      .default([]),
    sizes: z.array(z.string().trim().min(1)).min(1, "Add at least one size."),
    isFeatured: z.boolean().default(false),
  })
  .refine((data) => data.compareAtPrice === null || data.compareAtPrice > data.price, {
    message: "The compare-at price must be higher than the price.",
    path: ["compareAtPrice"],
  });

export type AdminProductInput = z.input<typeof adminProductSchema>;
export type AdminProductPayload = z.output<typeof adminProductSchema>;
