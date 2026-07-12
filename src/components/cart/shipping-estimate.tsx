"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/layout/icons";
import { shippingCountries, FREE_SHIPPING_THRESHOLD } from "@/constants/cart";
import { formatPrice } from "@/lib/utils";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";

/** Shipping estimate — UI only; always returns the same friendly demo answer. */
export function ShippingEstimate() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("cart.shippingEstimate");
  const tCountries = useTranslations("countries");
  const [countryKey, setCountryKey] = React.useState<string>(shippingCountries[0].key);
  const [postalCode, setPostalCode] = React.useState("");
  const [estimate, setEstimate] = React.useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const country = tCountries(countryKey);
    const threshold = formatPrice(FREE_SHIPPING_THRESHOLD, "USD", intlTagByLocale[locale]);
    setEstimate(
      postalCode
        ? t("result", { country, postalCode, threshold })
        : t("resultNoPostal", { country, threshold })
    );
  }

  return (
    <details className="group border-border border-t">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium tracking-wide select-none [&::-webkit-details-marker]:hidden">
        {t("estimate")}
        <ChevronDownIcon className="text-muted size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <form onSubmit={submit} className="animate-fade-in flex flex-col gap-3 pb-4">
        <Select
          aria-label={t("countryAria")}
          value={countryKey}
          onChange={(event) => setCountryKey(event.target.value)}
          className="h-10 rounded-xl text-sm"
        >
          {shippingCountries.map((country) => (
            <option key={country.key} value={country.key}>
              {tCountries(country.key)}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <input
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            placeholder={t("postalCode")}
            aria-label={t("postalCode")}
            className="border-border bg-surface-elevated placeholder:text-muted focus:border-secondary focus:ring-secondary/25 h-10 w-full flex-1 rounded-xl border px-3.5 text-sm transition-all focus:ring-2 focus:outline-none"
          />
          <Button type="submit" variant="outline" size="sm" className="h-10 rounded-xl">
            {t("estimateButton")}
          </Button>
        </div>
        {estimate && (
          <p role="status" className="animate-fade-in text-success text-xs leading-relaxed">
            {estimate}
          </p>
        )}
      </form>
    </details>
  );
}
