"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

export interface ColorSelectorProps {
  colors: ColorOption[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorSelector({ colors, value, onChange, className }: ColorSelectorProps) {
  const selected = colors.find((color) => color.value === value);

  return (
    <div className={cn("flex flex-col gap-3", className)} role="group" aria-label="Color">
      <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
        Color{selected && <span className="normal-case"> — {selected.label}</span>}
      </p>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            aria-pressed={value === color.value}
            title={color.label}
            onClick={() => onChange(color.value)}
            style={{ backgroundColor: color.hex }}
            className={cn(
              "border-border size-9 rounded-full border transition-all hover:scale-110",
              "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              value === color.value && "ring-ring ring-offset-background ring-2 ring-offset-2"
            )}
          >
            <span className="sr-only">{color.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
