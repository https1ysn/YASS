"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SortDropdown } from "./sort-dropdown";

export interface ProductToolbarProps {
  /** Number of pieces shown in the grid. */
  count: number;
  className?: string;
}

export function ProductToolbar({ count, className }: ProductToolbarProps) {
  const t = useTranslations("shop.toolbar");

  return (
    <div
      className={cn(
        "border-border flex items-center justify-between gap-3 border-y py-4",
        className
      )}
    >
      <p className="text-muted text-sm">
        <span className="text-foreground font-semibold">{count}</span>{" "}
        {count === 1 ? t("piece") : t("pieces")}
      </p>

      <SortDropdown />
    </div>
  );
}
