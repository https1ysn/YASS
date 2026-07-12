"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { sortOptions } from "@/constants/shop";
import { useFilters } from "./filters-context";

/** "price-asc" → "priceAsc" — matches the shop.sort.* translation keys. */
function toMessageKey(value: string): string {
  return value.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function SortDropdown({ className }: { className?: string }) {
  const { state, setSort } = useFilters();
  const t = useTranslations("shop.sort");

  return (
    <div className={cn("w-44 sm:w-52", className)}>
      <Select
        aria-label={t("ariaLabel")}
        value={state.sort}
        onChange={(event) => setSort(event.target.value)}
        className="h-10 rounded-xl text-sm"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t(toMessageKey(option.value))}
          </option>
        ))}
      </Select>
    </div>
  );
}
