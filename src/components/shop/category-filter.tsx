"use client";

import * as React from "react";
import { filterCategories } from "@/constants/shop";
import { useFilters } from "./filters-context";
import { FilterGroup } from "./product-filters";

export function CategoryFilter() {
  const { state, toggle } = useFilters();

  return (
    <FilterGroup title="Category">
      <div className="flex flex-col gap-3">
        {filterCategories.map((category) => (
          <label
            key={category.value}
            className="text-foreground/80 hover:text-foreground flex cursor-pointer items-center gap-3 text-sm transition-colors"
          >
            <input
              type="checkbox"
              checked={state.categories.includes(category.value)}
              onChange={() => toggle("categories", category.value)}
              className="accent-secondary size-4 rounded"
            />
            <span className="flex-1">{category.label}</span>
            <span className="text-muted text-xs">{category.count}</span>
          </label>
        ))}
      </div>
    </FilterGroup>
  );
}
