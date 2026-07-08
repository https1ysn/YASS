import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-foreground/25 bg-transparent text-foreground",
  muted: "bg-foreground/8 text-muted",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-danger/12 text-danger",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ variant = "primary", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium tracking-wider uppercase",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
