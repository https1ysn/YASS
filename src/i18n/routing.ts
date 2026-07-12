import { defineRouting } from "next-intl/routing";

/**
 * The three storefront locales. French is the default — every unprefixed or
 * unrecognized path redirects here. The admin dashboard is intentionally
 * outside this routing (see src/app/admin — a separate, unlocalized root).
 */
export const routing = defineRouting({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "always",
  // French is the default for every fresh visit — do not infer the locale from
  // the browser's Accept-Language header. A returning visitor's explicit choice
  // is still remembered via the NEXT_LOCALE cookie below (set by the switcher).
  localeDetection: false,
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type AppLocale = (typeof routing.locales)[number];

export const localeNames: Record<AppLocale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const localeFlags: Record<AppLocale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  ar: "🇲🇦",
};

export function isRtlLocale(locale: string): boolean {
  return locale === "ar";
}

/**
 * BCP-47 tags for Intl.NumberFormat/DateTimeFormat. Arabic uses "ar-MA"
 * (Morocco) rather than plain "ar" so prices and dates render with Western
 * digits, matching the rest of the UI and the brand's Moroccan context
 * (+212 phone placeholder, Morocco as the default shipping country).
 */
export const intlTagByLocale: Record<AppLocale, string> = {
  fr: "fr-FR",
  en: "en-US",
  ar: "ar-MA",
};
