"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SizeSelectorProps {
  sizes: string[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export function SizeSelector({ sizes, value, onChange, className }: SizeSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} role="group" aria-label="Size">
      <div className="flex items-center justify-between">
        <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
          Size{value && <span className="normal-case"> — {value}</span>}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={value === size}
            onClick={() => onChange(size)}
            className={cn(
              "h-11 min-w-13 rounded-xl border px-3.5 text-sm font-medium transition-all",
              "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              value === size
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-surface-elevated text-foreground/80 hover:border-primary/40 hover:text-foreground"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
