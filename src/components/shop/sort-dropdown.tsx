"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { sortOptions } from "@/constants/shop";
import { useFilters } from "./filters-context";

export function SortDropdown({ className }: { className?: string }) {
  const { state, setSort } = useFilters();

  return (
    <div className={cn("w-44 sm:w-52", className)}>
      <Select
        aria-label="Sort by"
        value={state.sort}
        onChange={(event) => setSort(event.target.value)}
        className="h-10 rounded-xl text-sm"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
