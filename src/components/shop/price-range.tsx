"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useFilters } from "./filters-context";
import { FilterGroup } from "./product-filters";

function PriceInput({
  label,
  ariaLabel,
  value,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <span
        aria-hidden="true"
        className="text-muted pointer-events-none absolute top-1/2 start-3 -translate-y-1/2 text-sm"
      >
        $
      </span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        placeholder={label}
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-border bg-surface-elevated text-foreground placeholder:text-muted focus:border-secondary focus:ring-secondary/25 h-10 w-full rounded-xl border ps-7 pe-3 text-sm transition-all focus:ring-2 focus:outline-none"
      />
    </div>
  );
}

export function PriceRange() {
  const { state, setPrice } = useFilters();
  const t = useTranslations("shop.filters");

  return (
    <FilterGroup title={t("price")}>
      <div className="flex items-center gap-3">
        <PriceInput
          label={t("min")}
          ariaLabel={t("priceAria", { label: t("min") })}
          value={state.priceMin}
          onChange={(min) => setPrice(min, state.priceMax)}
        />
        <span aria-hidden="true" className="text-muted">
          –
        </span>
        <PriceInput
          label={t("max")}
          ariaLabel={t("priceAria", { label: t("max") })}
          value={state.priceMax}
          onChange={(max) => setPrice(state.priceMin, max)}
        />
      </div>
    </FilterGroup>
  );
}
