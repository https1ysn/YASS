"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { filterAvailability, filterCategories, filterColors } from "@/constants/shop";
import { useFilters, type FilterGroupKey } from "./filters-context";

interface Chip {
  group: FilterGroupKey | "price";
  value: string;
  label: string;
}

function labelFor(group: FilterGroupKey, value: string): string {
  if (group === "categories")
    return filterCategories.find((c) => c.value === value)?.label ?? value;
  if (group === "colors") return filterColors.find((c) => c.value === value)?.label ?? value;
  if (group === "availability")
    return filterAvailability.find((a) => a.value === value)?.label ?? value;
  return value;
}

export function ActiveFilters({ className }: { className?: string }) {
  const { state, toggle, clearPrice, clearAll, activeCount } = useFilters();
  if (activeCount === 0) return null;

  const chips: Chip[] = (
    ["categories", "colors", "sizes", "availability"] as FilterGroupKey[]
  ).flatMap((group) =>
    state[group].map((value) => ({ group, value, label: labelFor(group, value) }))
  );

  if (state.priceMin || state.priceMax) {
    chips.push({
      group: "price",
      value: "price",
      label: `$${state.priceMin || "0"} – $${state.priceMax || "∞"}`,
    });
  }

  return (
    <div className={cn("animate-fade-in flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <button
          key={`${chip.group}-${chip.value}`}
          type="button"
          onClick={() => (chip.group === "price" ? clearPrice() : toggle(chip.group, chip.value))}
          aria-label={`Remove filter: ${chip.label}`}
          className="border-border bg-surface-elevated text-foreground/80 hover:border-danger/40 hover:text-danger inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all"
        >
          {chip.label}
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-3">
            <path
              d="M5 5 15 15M15 5 5 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-muted hover:text-foreground ml-1 text-xs font-medium underline-offset-4 transition-colors hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
