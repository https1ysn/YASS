import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-foreground text-sm font-medium tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "border-border bg-surface-elevated text-foreground shadow-soft h-11 w-full rounded-2xl border px-4 text-sm transition-all",
            "placeholder:text-muted",
            "focus:border-secondary focus:ring-secondary/25 focus:ring-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus:border-danger focus:ring-danger/25",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-muted text-sm">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
