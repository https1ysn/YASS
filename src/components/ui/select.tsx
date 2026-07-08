import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className, id, children, ...props }, ref) => {
    const autoId = React.useId();
    const selectId = id ?? autoId;
    const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label htmlFor={selectId} className="text-foreground text-sm font-medium tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "border-border bg-surface-elevated text-foreground shadow-soft h-11 w-full appearance-none rounded-2xl border pr-10 pl-4 text-sm transition-all",
              "focus:border-secondary focus:ring-secondary/25 focus:ring-2 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger focus:border-danger focus:ring-danger/25",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="text-muted pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
          >
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {error ? (
          <p id={`${selectId}-error`} role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : hint ? (
          <p id={`${selectId}-hint`} className="text-muted text-sm">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
