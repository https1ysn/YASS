import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const autoId = React.useId();
    const textareaId = id ?? autoId;
    const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label htmlFor={textareaId} className="text-foreground text-sm font-medium tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "border-border bg-surface-elevated text-foreground shadow-soft min-h-28 w-full rounded-2xl border px-4 py-3 text-sm transition-all",
            "placeholder:text-muted",
            "focus:border-secondary focus:ring-secondary/25 focus:ring-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus:border-danger focus:ring-danger/25",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${textareaId}-error`} role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-hint`} className="text-muted text-sm">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
