import * as React from "react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  full: "max-w-none",
} as const;

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizes;
  as?: "div" | "main" | "article" | "aside";
}

export function Container({ size = "lg", as: Tag = "div", className, ...props }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size], className)} {...props} />
  );
}
