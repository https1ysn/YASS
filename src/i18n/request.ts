import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { applyContentOverrides, getContentOverrides } from "@/lib/content";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // The shipped catalog is the source of truth for which keys exist and what
  // they say by default; Admin → Content overrides the wording per locale.
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const overrides = await getContentOverrides(locale);

  return { locale, messages: applyContentOverrides(messages, overrides) };
});
