import { notFound } from "next/navigation";

/** Catch-all for unknown storefront URLs — renders the themed not-found page
 * (next-intl's recommended pattern for localized 404s). */
export default function CatchAllPage() {
  notFound();
}
