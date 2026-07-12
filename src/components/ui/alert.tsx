"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  info: "border-info/30 bg-info/10 text-info",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
} as const;

export type StatusVariant = keyof typeof variants;

export function StatusIcon({ variant }: { variant: StatusVariant }) {
  const paths: Record<StatusVariant, React.ReactNode> = {
    info: <path d="M10 9v5m0-8.5v.5" />,
    success: <path d="m6.5 10.5 2.5 2.5 4.5-5.5" />,
    warning: <path d="M10 6.5v4.5m0 3v.5" />,
    danger: <path d="M7 7l6 6m0-6-6 6" />,
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
    >
      <circle cx="10" cy="10" r="8.25" />
      {paths[variant]}
    </svg>
  );
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: StatusVariant;
  title?: string;
  dismissible?: boolean;
  /** aria-label for the dismiss button — override with a translated string outside admin. */
  dismissLabel?: string;
}

export function Alert({
  variant = "info",
  title,
  dismissible = false,
  dismissLabel = "Dismiss",
  className,
  children,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  return (
    <div
      role={variant === "danger" || variant === "warning" ? "alert" : "status"}
      className={cn(
        "animate-fade-in flex items-start gap-3 rounded-2xl border p-4 sm:p-5",
        variants[variant],
        className
      )}
      {...props}
    >
      <StatusIcon variant={variant} />
      <div className="flex flex-1 flex-col gap-1">
        {title && <p className="text-sm font-semibold tracking-wide">{title}</p>}
        {children && <div className="text-foreground/80 text-sm leading-relaxed">{children}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={dismissLabel}
          className="hover:bg-foreground/5 -m-1 rounded-full p-1 transition-colors"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
            <path
              d="M5 5 15 15M15 5 5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
