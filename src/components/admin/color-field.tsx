"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
}

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Expand a 3-digit hex to 6 digits so <input type="color"> accepts it. */
function toColorInputValue(value: string): string {
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return HEX.test(value) ? value : "#000000";
}

/**
 * A real color picker: a native swatch (the OS color dialog) sitting flush
 * against a hex text input, kept in sync. Matches the design-system Input.
 */
export function ColorField({ label, value, onChange, hint, error, disabled }: ColorFieldProps) {
  const id = React.useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={`${id}-hex`} className="text-foreground text-sm font-medium tracking-wide">
        {label}
      </label>
      <div
        className={cn(
          "border-border bg-surface-elevated shadow-soft flex h-11 items-center gap-2 rounded-2xl border pr-3 pl-1.5 transition-all",
          "focus-within:border-secondary focus-within:ring-secondary/25 focus-within:ring-2",
          error && "border-danger focus-within:border-danger focus-within:ring-danger/25",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="relative size-8 shrink-0 overflow-hidden rounded-xl border border-border">
          <input
            type="color"
            aria-label={`${label} swatch`}
            value={toColorInputValue(value)}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className="absolute -inset-1 size-[calc(100%+8px)] cursor-pointer border-0 bg-transparent p-0"
          />
        </span>
        <input
          id={`${id}-hex`}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            let next = event.target.value.trim();
            if (next && !next.startsWith("#")) next = `#${next}`;
            onChange(next);
          }}
          placeholder="#000000"
          className="text-foreground placeholder:text-muted h-full w-full min-w-0 bg-transparent font-mono text-sm uppercase focus:outline-none"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted text-sm">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
