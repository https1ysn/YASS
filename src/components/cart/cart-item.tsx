"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn, formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/cart";
import { QuantitySelector } from "@/components/product";
import { filterColors } from "@/constants/shop";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";

export interface CartItemProps {
  line: CartLine;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  /** Omit to hide the "Save for later" action (e.g. in the saved list). */
  onSaveForLater?: (id: string) => void;
  className?: string;
}

const actionClasses =
  "text-xs font-medium text-muted underline-offset-4 transition-colors hover:underline";

export function CartItem({
  line,
  onQuantityChange,
  onRemove,
  onSaveForLater,
  className,
}: CartItemProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("cart");
  const tColors = useTranslations("colors");
  const colorLabel = filterColors.some((c) => c.value === line.color)
    ? tColors(line.color)
    : line.color;
  const price = (value: number) => formatPrice(value, "USD", intlTagByLocale[locale]);

  return (
    <li className={cn("animate-fade-in flex gap-4 py-6 sm:gap-6", className)}>
      <Link
        href={line.product.href}
        aria-label={line.product.name}
        className="border-border bg-surface-elevated relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl border sm:w-28"
      >
        <Image
          src={line.product.imageSrc}
          alt={line.product.imageAlt ?? line.product.name}
          fill
          sizes="112px"
          className="ease-luxury object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-muted text-[11px] font-medium tracking-[0.15em] uppercase">
              {line.product.category}
            </p>
            <Link
              href={line.product.href}
              className="text-foreground truncate text-sm font-semibold underline-offset-4 hover:underline sm:text-base"
            >
              {line.product.name}
            </Link>
            <p className="text-muted text-sm">
              {t("lineMeta", { color: colorLabel, size: line.size })}
            </p>
            {line.quantity > 1 && (
              <p className="text-muted text-xs">{t("item.each", { price: price(line.product.price) })}</p>
            )}
          </div>
          <p className="text-sm font-semibold whitespace-nowrap sm:text-base">
            {price(line.product.price * line.quantity)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <QuantitySelector
            value={line.quantity}
            onChange={(quantity) => onQuantityChange(line.id, quantity)}
          />
          <div className="flex items-center gap-4">
            {onSaveForLater && (
              <button
                type="button"
                onClick={() => onSaveForLater(line.id)}
                className={cn(actionClasses, "hover:text-foreground")}
              >
                {t("item.saveForLater")}
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(line.id)}
              className={cn(actionClasses, "hover:text-danger")}
            >
              {t("item.remove")}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
