"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  totalPages: number;
  /** Render items as links (preferred for SEO) — receives the page number. */
  createHref?: (page: number) => string;
  /** Render items as buttons for client-side paging. */
  onPageChange?: (page: number) => void;
  className?: string;
  /** aria-labels — override with translated strings outside admin. */
  navAriaLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
}

const ELLIPSIS = "…" as const;

function getRange(page: number, totalPages: number): (number | typeof ELLIPSIS)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, ELLIPSIS, totalPages];
  if (page >= totalPages - 3)
    return [
      1,
      ELLIPSIS,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  return [1, ELLIPSIS, page - 1, page, page + 1, ELLIPSIS, totalPages];
}

const itemClasses =
  "inline-flex size-11 items-center justify-center rounded-2xl text-sm font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Pagination({
  page,
  totalPages,
  createHref,
  onPageChange,
  className,
  navAriaLabel = "Pagination",
  previousLabel = "Previous page",
  nextLabel = "Next page",
  pageLabel = (p) => `Page ${p}`,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function renderItem(target: number, label: React.ReactNode, ariaLabel: string, active = false) {
    const classes = cn(
      itemClasses,
      active
        ? "bg-primary text-primary-foreground shadow-soft"
        : "text-foreground hover:bg-foreground/5"
    );
    if (createHref) {
      return (
        <Link
          href={createHref(target)}
          aria-label={ariaLabel}
          aria-current={active ? "page" : undefined}
          className={classes}
        >
          {label}
        </Link>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onPageChange?.(target)}
        aria-label={ariaLabel}
        aria-current={active ? "page" : undefined}
        className={classes}
      >
        {label}
      </button>
    );
  }

  return (
    <nav
      aria-label={navAriaLabel}
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {page > 1 && renderItem(page - 1, <Chevron direction="left" />, previousLabel)}
      {getRange(page, totalPages).map((item, index) =>
        item === ELLIPSIS ? (
          <span key={`e-${index}`} aria-hidden="true" className="text-muted px-2">
            {ELLIPSIS}
          </span>
        ) : (
          <React.Fragment key={item}>
            {renderItem(item, item, pageLabel(item), item === page)}
          </React.Fragment>
        )
      )}
      {page < totalPages && renderItem(page + 1, <Chevron direction="right" />, nextLabel)}
    </nav>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={cn(
        "size-4",
        direction === "left" ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180"
      )}
    >
      <path
        d="m7.5 5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
