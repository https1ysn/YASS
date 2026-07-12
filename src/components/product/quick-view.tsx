"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { useCartStore } from "@/store/cart-store";
import { filterColors } from "@/constants/shop";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";
import { localeHref } from "@/i18n/alternates";
import { translateBadge } from "@/lib/product-badge";

export interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
}

/** Quick-view modal — UI only; "Add to bag" is a visual demo. */
export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("product.quickView");
  const tProduct = useTranslations("product");
  const tColors = useTranslations("colors");
  const tSizes = useTranslations("sizes");
  const tBadges = useTranslations("badges");
  const tCommon = useTranslations("common");
  const addLine = useCartStore((state) => state.addLine);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedColor(product?.colors[0] ?? null);
    setSelectedSize(null);
  }, [product]);

  if (!product) return null;

  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const swatches = filterColors
    .map((color) => ({ ...color, label: tColors(color.value) }))
    .filter((color) => product.colors.includes(color.value));
  const price = (value: number) => formatPrice(value, "USD", intlTagByLocale[locale]);
  const sizeLabel = (size: string) => (size === "One size" ? tSizes("oneSize") : size);

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={product.name}
      description={product.category}
      closeLabel={tCommon("close")}
    >
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        <div className="border-border relative aspect-[4/5] overflow-hidden rounded-2xl border">
          <Image
            src={product.imageSrc}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
          />
          {product.badge && (
            <Badge variant="primary" className="absolute top-4 start-4">
              {translateBadge(product.badge, tBadges)}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold tracking-tight">{price(product.price)}</span>
            {onSale && <s className="text-muted text-sm">{price(product.compareAtPrice!)}</s>}
          </div>

          <p className="text-muted text-sm leading-relaxed">{product.description}</p>

          {swatches.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
                {tProduct("color")}{" "}
                <span className="normal-case">
                  — {swatches.find((s) => s.value === selectedColor)?.label}
                </span>
              </p>
              <div className="flex gap-2.5">
                {swatches.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    aria-pressed={selectedColor === color.value}
                    title={color.label}
                    onClick={() => setSelectedColor(color.value)}
                    style={{ backgroundColor: color.hex }}
                    className={cn(
                      "border-border size-7 rounded-full border transition-all hover:scale-110",
                      selectedColor === color.value &&
                        "ring-ring ring-offset-surface-elevated ring-2 ring-offset-2"
                    )}
                  >
                    <span className="sr-only">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
              {tProduct("size")}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-9 min-w-11 rounded-xl border px-3 text-sm font-medium transition-all",
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground/80 hover:border-primary/40"
                  )}
                >
                  {sizeLabel(size)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2.5 pt-2">
            <Button
              fullWidth
              onClick={() => {
                const size = selectedSize ?? product.sizes[0];
                addLine(product, {
                  size,
                  color: selectedColor ?? product.colors[0] ?? "",
                });
                toast({
                  title: t("addedToBag"),
                  description: t("addedToBagDescription", { name: product.name, size }),
                  variant: "success",
                });
                onClose();
              }}
            >
              {t("addToBag")}
            </Button>
            <ButtonLink href={localeHref(locale, product.href)} variant="outline" fullWidth>
              {t("viewFullDetails")}
            </ButtonLink>
          </div>
        </div>
      </div>
    </Modal>
  );
}
