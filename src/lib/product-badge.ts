/**
 * Product badges ("New", "Best Seller", "Sale") are a fixed, controlled
 * vocabulary — whether the value comes from Supabase or the fallback
 * catalog, it's always one of these three. Translate at display time rather
 * than storing per-locale values anywhere.
 */
export function translateBadge(
  badge: string | null | undefined,
  t: (key: string) => string
): string | undefined {
  if (!badge) return undefined;
  switch (badge) {
    case "New":
      return t("new");
    case "Best Seller":
      return t("bestSeller");
    case "Sale":
      return t("sale");
    default:
      return badge;
  }
}
