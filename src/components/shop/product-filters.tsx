"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFilters } from "./filters-context";
import { CategoryFilter } from "./category-filter";
import { PriceRange } from "./price-range";
import { ColorFilter } from "./color-filter";
import { SizeFilter } from "./size-filter";
import { AvailabilityFilter } from "./availability-filter";

/** Titled group used by each individual filter. */
export function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <h3 className="text-muted text-xs font-medium tracking-[0.18em] uppercase sm:text-xs">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Full refinement panel — rendered in the desktop sidebar and mobile drawer. */
export function ProductFilters({ className }: { className?: string }) {
  const { clearAll, activeCount } = useFilters();

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold tracking-tight">Refine</p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-secondary text-xs font-medium underline-offset-4 transition-colors hover:underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>
      <div className="border-border flex flex-col gap-8 border-t pt-8">
        <CategoryFilter />
        <PriceRange />
        <ColorFilter />
        <SizeFilter />
        <AvailabilityFilter />
      </div>
    </div>
  );
}
