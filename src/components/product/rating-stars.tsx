"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

/** Five-star rating with optional review count — static placeholder data. */
export function RatingStars({ rating, reviewCount, className }: RatingStarsProps) {
  const t = useTranslations("product.rating");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        role="img"
        aria-label={t("ratedAria", { rating })}
        className="text-secondary flex gap-0.5"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill={star <= Math.round(rating) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.25"
            className="size-4"
          >
            <path d="m10 2.5 2.2 4.9 5.3.5-4 3.6 1.1 5.2L10 14l-4.6 2.7 1.1-5.2-4-3.6 5.3-.5L10 2.5Z" />
          </svg>
        ))}
      </div>
      <p className="text-muted text-sm">
        <span className="text-foreground font-medium">{rating.toFixed(1)}</span>
        {reviewCount != null && (
          <span>
            {" "}
            · {reviewCount} {reviewCount === 1 ? t("review") : t("reviews")}
          </span>
        )}
      </p>
    </div>
  );
}
