"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useFilters } from "./filters-context";
import { FilterGroup } from "./product-filters";

/** Category checkboxes — sourced live from Supabase, never hardcoded. */
export function CategoryFilter() {
  const { state, toggle, categories } = useFilters();
  const t = useTranslations("shop.filters");

  if (categories.length === 0) return null;

  return (
    <FilterGroup title={t("category")}>
      <div className="flex flex-col gap-3">
        {categories.map((category) => (
          <label
            key={category.slug}
            className="text-foreground/80 hover:text-foreground flex cursor-pointer items-center gap-3 text-sm transition-colors"
          >
            <input
              type="checkbox"
              checked={state.categories.includes(category.slug)}
              onChange={() => toggle("categories", category.slug)}
              className="accent-secondary size-4 rounded"
            />
            <span className="flex-1">{category.name}</span>
            <span className="text-muted text-xs">{category.pieceCount}</span>
          </label>
        ))}
      </div>
    </FilterGroup>
  );
}
