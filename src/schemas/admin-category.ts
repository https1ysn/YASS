import { z } from "zod";

/** Validation for the admin category form — shared by client and server action. */
export const adminCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Please enter a category name.").max(140),
  slug: z
    .string()
    .trim()
    .min(2, "Please enter a slug.")
    .max(140)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and hyphens only (e.g. summer-capsule)."
    ),
  description: z.string().trim().max(2000, "Keep the description under 2000 characters."),
  imageUrl: z.string().min(1).nullable(),
  sortOrder: z
    .number({ message: "Enter a valid sort order." })
    .int("Enter a whole number.")
    .min(0, "The sort order can't be negative.")
    .max(9999),
  isComingSoon: z.boolean().default(false),
});

export type AdminCategoryInput = z.input<typeof adminCategorySchema>;
export type AdminCategoryPayload = z.output<typeof adminCategorySchema>;
