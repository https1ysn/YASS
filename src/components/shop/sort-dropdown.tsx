"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { sortOptions } from "@/constants/shop";

/** "price-asc" → "priceAsc" — matches the shop.sort.* translation keys. */
function toMessageKey(value: string): string {
  return value.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function SortDropdown({ className }: { className?: string }) {
  const [sort, setSort] = React.useState("featured");
  const t = useTranslations("shop.sort");

  return (
    <div className={cn("w-44 sm:w-52", className)}>
      <Select
        // Stable id — falling back to useId() makes the value depend on the
        // render tree, which differs between the server and the client here.
        id="shop-sort"
        aria-label={t("ariaLabel")}
        value={sort}
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
