"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { filterColors } from "@/constants/shop";
import { useFilters } from "./filters-context";
import { FilterGroup } from "./product-filters";

export function ColorFilter() {
  const { state, toggle } = useFilters();

  return (
    <FilterGroup title="Color">
      <div className="flex flex-wrap gap-3">
        {filterColors.map((color) => {
          const selected = state.colors.includes(color.value);
          return (
            <button
              key={color.value}
              type="button"
              aria-pressed={selected}
              title={color.label}
              onClick={() => toggle("colors", color.value)}
              style={{ backgroundColor: color.hex }}
              className={cn(
                "border-border size-8 rounded-full border transition-all hover:scale-110",
                "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                selected && "ring-ring ring-offset-background ring-2 ring-offset-2"
              )}
            >
              <span className="sr-only">{color.label}</span>
            </button>
          );
        })}
      </div>
    </FilterGroup>
  );
}
