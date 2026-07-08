import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className} {...props}>
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted hover:text-foreground tracking-wide transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "tracking-wide",
                    isLast ? "text-foreground font-medium" : "text-muted"
                  )}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-muted/60 size-3.5"
                >
                  <path
                    d="m7.5 5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
