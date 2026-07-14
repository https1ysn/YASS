"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { ProductQuickView } from "@/components/product/quick-view";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";
import { localeHref } from "@/i18n/alternates";
import { translateBadge } from "@/lib/product-badge";

export interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  const [quickView, setQuickView] = React.useState<Product | null>(null);
  const t = useTranslations("shop");
  const tBadges = useTranslations("badges");
  const locale = useLocale() as AppLocale;

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4",
          className
        )}
      >
        {products.map((product, index) => (
          <Reveal key={product.slug} delay={Math.min(index, 5) * 60}>
            <ProductCard
              name={product.name}
              href={localeHref(locale, product.href)}
              imageSrc={product.imageSrc}
              imageAlt={product.imageAlt}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              category={product.category}
              badge={translateBadge(product.badge, tBadges)}
              saleLabel={tBadges("sale")}
              locale={intlTagByLocale[locale]}
              className="h-full"
              footer={
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setQuickView(product)}
                  className="border-border rounded-xl border"
                >
                  {t("quickView")}
                </Button>
              }
            />
          </Reveal>
        ))}
      </div>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
