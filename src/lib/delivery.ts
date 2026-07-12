import { intlTagByLocale, type AppLocale } from "@/i18n/routing";

/** Estimated delivery date range, skipping weekends. */
export function estimateDeliveryRange(
  method: "standard" | "express",
  locale: AppLocale,
  from: Date = new Date()
): string {
  const [minDays, maxDays] = method === "express" ? [1, 2] : [2, 4];

  function addBusinessDays(date: Date, days: number) {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) added += 1;
    }
    return result;
  }

  const start = addBusinessDays(from, minDays);
  const end = addBusinessDays(from, maxDays);

  const tag = intlTagByLocale[locale];
  const monthDay = new Intl.DateTimeFormat(tag, { month: "long", day: "numeric" });
  const dayOnly = new Intl.DateTimeFormat(tag, { day: "numeric" });

  const range =
    start.getMonth() === end.getMonth()
      ? `${monthDay.format(start)} – ${dayOnly.format(end)}`
      : `${monthDay.format(start)} – ${monthDay.format(end)}`;

  return `${range}, ${end.getFullYear()}`;
}
