"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/types/product";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/components/ui/product-card";
import { Reveal } from "@/components/shared/reveal";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";
import { localeHref } from "@/i18n/alternates";
import { translateBadge } from "@/lib/product-badge";

export interface ProductRailProps {
  eyebrow?: string;
  title: string;
  products: Product[];
  className?: string;
}

/**
 * Horizontal product rail — snap-scrolls on mobile, grid from sm up.
 * Reused for Related, Recently Viewed and You May Also Like.
 */
export function ProductRail({ eyebrow, title, products, className }: ProductRailProps) {
  const locale = useLocale() as AppLocale;
  const tBadges = useTranslations("badges");

  if (products.length === 0) return null;

  return (
    <Section eyebrow={eyebrow} title={title} spacing="sm" className={className}>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {products.map((product, index) => (
          <Reveal
            key={product.slug}
            delay={index * 80}
            className="w-[72%] shrink-0 snap-start sm:w-auto sm:shrink"
          >
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
            />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
