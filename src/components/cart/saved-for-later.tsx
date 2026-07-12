"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn, formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/cart";
import { Button } from "@/components/ui/button";
import { filterColors } from "@/constants/shop";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";

export interface SavedForLaterProps {
  lines: CartLine[];
  onMoveToBag: (id: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

/** "Saved for later" list — UI only. */
export function SavedForLater({ lines, onMoveToBag, onRemove, className }: SavedForLaterProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("cart");
  const tSaved = useTranslations("cart.savedForLater");
  const tColors = useTranslations("colors");
  const price = (value: number) => formatPrice(value, "USD", intlTagByLocale[locale]);

  if (lines.length === 0) return null;

  return (
    <section aria-label={tSaved("title")} className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
        {tSaved("title")}{" "}
        <span className="text-muted text-sm font-normal">({lines.length})</span>
      </h2>
      <ul className="divide-border divide-y">
        {lines.map((line) => {
          const colorLabel = filterColors.some((c) => c.value === line.color)
            ? tColors(line.color)
            : line.color;
          return (
            <li key={line.id} className="animate-fade-in flex items-center gap-4 py-5 sm:gap-6">
              <Link
                href={line.product.href}
                aria-label={line.product.name}
                className="border-border bg-surface-elevated relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl border sm:w-20"
              >
                <Image
                  src={line.product.imageSrc}
                  alt={line.product.imageAlt ?? line.product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link
                  href={line.product.href}
                  className="truncate text-sm font-semibold underline-offset-4 hover:underline"
                >
                  {line.product.name}
                </Link>
                <p className="text-muted text-sm">
                  {t("lineMeta", { color: colorLabel, size: line.size })}
                </p>
                <p className="text-sm font-medium">{price(line.product.price)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMoveToBag(line.id)}
                  className="rounded-xl"
                >
                  {tSaved("moveToBag")}
                </Button>
                <button
                  type="button"
                  onClick={() => onRemove(line.id)}
                  className="text-muted hover:text-danger text-xs font-medium underline-offset-4 transition-colors hover:underline"
                >
                  {tSaved("remove")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
