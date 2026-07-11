"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { filterSizes } from "@/constants/shop";
import { useFilters } from "./filters-context";
import { FilterGroup } from "./product-filters";

export function SizeFilter() {
  const { state, toggle } = useFilters();

  return (
    <FilterGroup title="Size">
      <div className="flex flex-wrap gap-2">
        {filterSizes.map((size) => {
          const selected = state.sizes.includes(size);
          return (
            <button
              key={size}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle("sizes", size)}
              className={cn(
                "h-10 min-w-12 rounded-xl border px-3 text-sm font-medium transition-all",
                "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-surface-elevated text-foreground/80 hover:border-primary/40 hover:text-foreground"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </FilterGroup>
  );
}
