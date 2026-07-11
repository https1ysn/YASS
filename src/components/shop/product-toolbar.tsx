"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { SortDropdown } from "./sort-dropdown";
import { ProductFilters } from "./product-filters";
import { useFilters } from "./filters-context";

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="size-4"
    >
      <path d="M3.5 6h13M6 10h8M8.5 14h3" />
    </svg>
  );
}

export interface ProductToolbarProps {
  /** Number of pieces shown in the grid. */
  count: number;
  className?: string;
}

export function ProductToolbar({ count, className }: ProductToolbarProps) {
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const { activeCount } = useFilters();

  return (
    <div
      className={cn(
        "border-border flex items-center justify-between gap-3 border-y py-4",
        className
      )}
    >
      <p className="text-muted text-sm">
        <span className="text-foreground font-semibold">{count}</span>{" "}
        {count === 1 ? "piece" : "pieces"}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen(true)}
          leftIcon={<FilterIcon />}
          className="h-10 rounded-xl lg:hidden"
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
        <SortDropdown />
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side="bottom"
        title="Filter & Sort"
        footer={
          <Button fullWidth onClick={() => setFiltersOpen(false)}>
            View results
          </Button>
        }
      >
        <ProductFilters />
      </Drawer>
    </div>
  );
}
