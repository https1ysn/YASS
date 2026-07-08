import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-shimmer bg-foreground/10 rounded-2xl",
        "[background-image:linear-gradient(110deg,transparent_25%,var(--surface-elevated)_50%,transparent_75%)] [background-size:200%_100%]",
        className
      )}
      {...props}
    />
  );
}
