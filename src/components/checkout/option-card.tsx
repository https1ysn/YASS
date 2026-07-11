"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface OptionCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  /** Right-aligned text, e.g. a price. */
  meta?: string;
  disabled?: boolean;
  disabledBadge?: string;
}

/** Radio option styled as a selectable card — used for shipping & payment. */
export function OptionCard({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  meta,
  disabled = false,
  disabledBadge,
}: OptionCardProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-3.5 rounded-2xl border p-4 transition-all sm:p-5",
        disabled ? "border-border bg-surface/50 cursor-not-allowed opacity-60" : "cursor-pointer",
        !disabled && checked
          ? "border-secondary bg-secondary/[0.07] shadow-soft ring-secondary ring-1"
          : !disabled && "border-border bg-surface-elevated hover:border-secondary/50"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="accent-secondary mt-0.5 size-4 shrink-0"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {label}
          {disabled && disabledBadge && (
            <Badge variant="muted" className="px-2 py-0.5 text-[10px]">
              {disabledBadge}
            </Badge>
          )}
        </span>
        {description && <span className="text-muted text-sm leading-relaxed">{description}</span>}
      </span>
      {meta && <span className="text-sm font-semibold whitespace-nowrap">{meta}</span>}
    </label>
  );
}
