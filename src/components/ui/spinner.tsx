import * as React from "react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-9 border-[3px]",
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof sizes;
  label?: string;
}

export function Spinner({ size = "md", label = "Loading", className, ...props }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)} {...props}>
      <span
        aria-hidden="true"
        className={cn("animate-spin rounded-full border-current border-t-transparent", sizes[size])}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
