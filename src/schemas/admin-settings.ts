import { z } from "zod";

/**
 * Validation for the Website Settings module — shared by the client form and
 * the server action. The shape mirrors the dashboard sections and every field
 * carries a default, so a partial or empty settings blob from the database
 * always resolves to a complete, render-safe object.
 */

/**
 * The only place the brand name is written down in the application. It seeds a
 * brand-new install and backs the very first render before an admin saves
 * anything; every rendered occurrence reads `branding.websiteName` instead.
 * Existing installs get their real name copied into the settings blob by
 * migration 20260724120000_branding_settings.sql.
 */
export const DEFAULT_WEBSITE_NAME = "Yasso Store";

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** A required brand color — a 3 or 6 digit hex value. */
const color = (fallback: string) =>
  z
    .string()
    .trim()
    .regex(HEX_COLOR, "Enter a valid hex color (e.g. #AD7D56).")
    .default(fallback);

/** An optional URL/link field — empty string is allowed and means "unset". */
const link = z
  .string()
  .trim()
  .max(500, "Keep links under 500 characters.")
  .default("");

/** A free-form text field with a length cap. */
const text = (max: number, fallback = "") =>
  z.string().trim().max(max, `Keep this under ${max} characters.`).default(fallback);

/** An uploaded image URL, or null when none is set. */
const imageUrl = z.string().trim().min(1).nullable().default(null);

export const brandingSchema = z.object({
  // Identity. Kept strict (not `.catch()`) so the admin form surfaces a real
  // "required" error instead of silently substituting the default; the read
  // path in lib/settings.ts already degrades to the defaults on a bad blob,
  // and the migration never writes a blank name.
  websiteName: z
    .string()
    .trim()
    .min(1, "A website name is required.")
    .max(120, "Keep the website name under 120 characters.")
    .default(DEFAULT_WEBSITE_NAME),
  tagline: text(200),
  logoUrl: imageUrl,
  faviconUrl: imageUrl,

  // Palette.
  primaryColor: color("#000000"),
  secondaryColor: color("#ad7d56"),
  accentColor: color("#c2916a"),
  successColor: color("#3f7a4e"),
  errorColor: color("#b3402f"),
});

export const announcementSchema = z.object({
  // Enabled by default so the storefront keeps its promo bar out of the box;
  // an empty `text` falls back to the built-in translated message.
  enabled: z.boolean().default(true),
  text: text(200),
  link,
  backgroundColor: color("#000000"),
  textColor: color("#ffffff"),
});

export const contactSchema = z.object({
  email: z
    .union([z.literal(""), z.string().trim().email("Enter a valid email address.")])
    .default(""),
  phone: text(40),
  whatsapp: text(40),
  address: text(300),
});

export const socialSchema = z.object({
  instagram: link,
  facebook: link,
  tiktok: link,
  x: link,
  youtube: link,
  linkedin: link,
});

export const storeSchema = z.object({
  currency: text(10, "MAD"),
  currencySymbol: text(6, "DH"),
  freeShippingThreshold: z
    .number({ message: "Enter a valid amount." })
    .min(0, "The threshold can't be negative.")
    .max(1_000_000)
    .default(150),
  defaultLanguage: z.enum(["en", "fr", "ar"]).default("en"),
  defaultCountry: text(60, "Morocco"),
});

export const homepageSchema = z.object({
  ctaBanner: text(300),
  newsletterTitle: text(160),
  newsletterDescription: text(400),
  footerText: text(400),
});

export const seoSchema = z.object({
  websiteTitle: text(160),
  metaTitle: text(160),
  metaDescription: text(320),
  ogImageUrl: imageUrl,
});

export const advancedSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: text(400, "We're making things better. Please check back soon."),
});

export const siteSettingsSchema = z.object({
  // prefault (not default) applies `{}` on the INPUT side so each section's
  // field-level defaults fill in when the section is missing from the blob.
  branding: brandingSchema.prefault({}),
  announcement: announcementSchema.prefault({}),
  contact: contactSchema.prefault({}),
  social: socialSchema.prefault({}),
  store: storeSchema.prefault({}),
  homepage: homepageSchema.prefault({}),
  seo: seoSchema.prefault({}),
  advanced: advancedSchema.prefault({}),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

/** A complete, render-safe settings object built purely from the defaults. */
export const DEFAULT_SETTINGS: SiteSettings = siteSettingsSchema.parse({});
