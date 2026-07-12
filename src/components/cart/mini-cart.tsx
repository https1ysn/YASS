"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/cart";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { BagIcon } from "@/components/layout/icons";
import { filterColors } from "@/constants/shop";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";
import { localeHref } from "@/i18n/alternates";

export interface MiniCartDrawerProps {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
}

/** Compact bag drawer opened from the header — static placeholder contents. */
export function MiniCartDrawer({ open, onClose, lines }: MiniCartDrawerProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("cart.miniCart");
  const tCart = useTranslations("cart");
  const tColors = useTranslations("colors");
  const tCommon = useTranslations("common");
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const price = (value: number) => formatPrice(value, "USD", intlTagByLocale[locale]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={count > 0 ? t("shoppingBagCount", { count }) : t("shoppingBag")}
      closeLabel={tCommon("close")}
      footer={
        lines.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted">{t("subtotal")}</span>
              <span className="text-base font-semibold">{price(subtotal)}</span>
            </div>
            <ButtonLink
              href={localeHref(locale, "/cart")}
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              {t("viewBag")}
            </ButtonLink>
            <ButtonLink href={localeHref(locale, "/checkout")} fullWidth onClick={onClose}>
              {t("checkout")}
            </ButtonLink>
            <p className="text-muted text-center text-xs">{t("footnote")}</p>
          </div>
        ) : undefined
      }
    >
      {lines.length > 0 ? (
        <ul className="divide-border divide-y">
          {lines.map((line) => {
            const colorLabel = filterColors.some((c) => c.value === line.color)
              ? tColors(line.color)
              : line.color;
            return (
              <li key={line.id} className="animate-fade-in flex gap-4 py-4">
                <Link
                  href={line.product.href}
                  onClick={onClose}
                  aria-label={line.product.name}
                  className="border-border bg-surface-elevated relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl border"
                >
                  <Image
                    src={line.product.imageSrc}
                    alt={line.product.imageAlt ?? line.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Link
                    href={line.product.href}
                    onClick={onClose}
                    className="truncate text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    {line.product.name}
                  </Link>
                  <p className="text-muted text-xs">
                    {tCart("lineMeta", { color: colorLabel, size: line.size })}
                  </p>
                  <p className="text-muted mt-auto text-sm">
                    {t("quantityTimes", { quantity: line.quantity })}{" "}
                    <span className="text-foreground">{price(line.product.price)}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
          <span className="bg-foreground/5 text-muted grid size-16 place-items-center rounded-full">
            <BagIcon className="size-7" />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="text-lg font-semibold tracking-tight">{t("emptyTitle")}</p>
            <p className="text-muted max-w-xs text-sm leading-relaxed">{t("emptyDescription")}</p>
          </div>
          <Button onClick={onClose}>{t("continueShopping")}</Button>
        </div>
      )}
    </Drawer>
  );
}
