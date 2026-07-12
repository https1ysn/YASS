import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in Moroccan dirham, e.g. 420 → "420.00 DH".
 * The number formatting is kept consistent across every locale; `currency` and
 * `locale` are accepted for backward compatibility but no longer change the
 * output (the store trades in a single currency).
 */
export function formatPrice(value: number, _currency = "MAD", _locale = "en-US") {
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${amount} DH`;
}

/** "Silk Wrap Dress" → "silk-wrap-dress". */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
