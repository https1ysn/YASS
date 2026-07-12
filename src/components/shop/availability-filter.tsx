"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { filterAvailability } from "@/constants/shop";
import { useFilters } from "./filters-context";
import { FilterGroup } from "./product-filters";

export function AvailabilityFilter() {
  const { state, toggle } = useFilters();
  const t = useTranslations("shop.filters");
  const tAvailability = useTranslations("availability");

  return (
    <FilterGroup title={t("availability")}>
      <div className="flex flex-col gap-3">
        {filterAvailability.map((option) => (
          <label
            key={option.value}
            className="text-foreground/80 hover:text-foreground flex cursor-pointer items-center gap-3 text-sm transition-colors"
          >
            <input
              type="checkbox"
              checked={state.availability.includes(option.value)}
              onChange={() => toggle("availability", option.value)}
              className="accent-secondary size-4 rounded"
            />
            <span className="flex-1">
              {tAvailability(option.value === "in-stock" ? "inStock" : "madeToOrder")}
            </span>
            <span className="text-muted text-xs">{option.count}</span>
          </label>
        ))}
      </div>
    </FilterGroup>
  );
}
