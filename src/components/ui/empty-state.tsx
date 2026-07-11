import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Slot for a call-to-action, e.g. a ButtonLink. */
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "animate-fade-in border-border bg-surface/50 flex flex-col items-center gap-5 rounded-2xl border border-dashed px-6 py-16 text-center sm:py-24",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="bg-foreground/5 text-muted grid size-16 place-items-center rounded-full">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-semibold tracking-tight sm:text-xl">{title}</p>
        {description && (
          <p className="text-muted mx-auto max-w-sm text-sm leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
