import { z } from "zod";

/** Validation for the admin Sizes module — shared by the client and the action. */
export const adminSizeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Please enter a size name.")
    .max(20, "Keep size names under 20 characters."),
  sortOrder: z
    .number({ message: "Enter a valid sort order." })
    .int("Enter a whole number.")
    .min(0, "The sort order can't be negative.")
    .max(9999),
  active: z.boolean().default(true),
});

export type AdminSizeInput = z.input<typeof adminSizeSchema>;
export type AdminSizePayload = z.output<typeof adminSizeSchema>;

/** A saved size as the admin UI and the product form consume it. */
export interface AdminSize {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
