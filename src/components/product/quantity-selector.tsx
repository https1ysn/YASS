"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 9,
  className,
}: QuantitySelectorProps) {
  const t = useTranslations("product.quantitySelector");
  const buttonClasses = cn(
    "grid size-11 place-items-center text-foreground transition-colors hover:bg-foreground/5",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-40"
  );

  return (
    <div
      role="group"
      aria-label={t("ariaLabel")}
      className={cn(
        "border-border bg-surface-elevated inline-flex items-center overflow-hidden rounded-xl border",
        className
      )}
    >
      <button
        type="button"
        aria-label={t("decrease")}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={buttonClasses}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
          <path d="M5 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <span aria-live="polite" className="w-10 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label={t("increase")}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={buttonClasses}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
          <path
            d="M10 5v10M5 10h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
