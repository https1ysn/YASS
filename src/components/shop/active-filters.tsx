"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types/product";
import { useFilters, type FilterGroupKey } from "./filters-context";

interface Chip {
  group: FilterGroupKey | "price";
  value: string;
  label: string;
}

export function ActiveFilters({ className }: { className?: string }) {
  const { state, toggle, clearPrice, clearAll, activeCount, categories } = useFilters();
  const t = useTranslations("shop.activeFilters");
  const tColors = useTranslations("colors");
  const tAvailability = useTranslations("availability");

  if (activeCount === 0) return null;

  function labelFor(group: FilterGroupKey, value: string, cats: Collection[]): string {
    if (group === "categories") return cats.find((c) => c.slug === value)?.name ?? value;
    if (group === "colors") return tColors(value);
    if (group === "availability")
      return tAvailability(value === "in-stock" ? "inStock" : "madeToOrder");
    return value;
  }

  const chips: Chip[] = (
    ["categories", "colors", "sizes", "availability"] as FilterGroupKey[]
  ).flatMap((group) =>
    state[group].map((value) => ({ group, value, label: labelFor(group, value, categories) }))
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
          aria-label={t("removeFilter", { label: chip.label })}
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
        className="text-muted hover:text-foreground ms-1 text-xs font-medium underline-offset-4 transition-colors hover:underline"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}
