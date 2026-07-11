import { z } from "zod";

/** Validation for the admin login form — shared by client and server action. */
export const adminLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  password: z.string().min(1, "Please enter your password.").max(256),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
