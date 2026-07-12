"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Collection, Product } from "@/types/product";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { BagIcon } from "@/components/layout/icons";
import { localeHref } from "@/i18n/alternates";
import type { AppLocale } from "@/i18n/routing";
import { FiltersProvider, useFilters } from "./filters-context";
import { ProductToolbar } from "./product-toolbar";
import { ActiveFilters } from "./active-filters";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";

export interface ProductBrowserProps {
  products: Product[];
  /** Live categories from Supabase — powers the category filter. */
  categories: Collection[];
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * The full browsing shell: toolbar, refinement sidebar (drawer on mobile),
 * active-filter chips, product grid and pagination. Category selections
 * filter the grid live; the other refinements remain UI-only.
 */
export function ProductBrowser({ products, categories, emptyTitle, emptyDescription }: ProductBrowserProps) {
  return (
    <FiltersProvider categories={categories}>
      <ProductBrowserContent
        products={products}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </FiltersProvider>
  );
}

function ProductBrowserContent({
  products,
  emptyTitle,
  emptyDescription,
}: Omit<ProductBrowserProps, "categories">) {
  const { state } = useFilters();
  const t = useTranslations("shop.browser");
  const locale = useLocale() as AppLocale;

  const visibleProducts =
    state.categories.length === 0
      ? products
      : products.filter((product) =>
          product.collections.some((collection) => state.categories.includes(collection))
        );

  return (
    <Container>
      <div className="flex flex-col gap-6 py-8 sm:py-12">
        <ProductToolbar count={visibleProducts.length} />
        <ActiveFilters />

        <div className="grid items-start gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
          <aside aria-label={t("productFilters")} className="sticky top-28 hidden lg:block">
            <ProductFilters />
          </aside>

          <div>
            {visibleProducts.length > 0 ? (
              <>
                <ProductGrid products={visibleProducts} />
                <Pagination
                  page={1}
                  totalPages={3}
                  createHref={(page) => `?page=${page}`}
                  className="mt-12 sm:mt-16"
                />
              </>
            ) : (
              <EmptyState
                icon={<BagIcon className="size-7" />}
                title={emptyTitle ?? t("emptyTitle")}
                description={emptyDescription ?? t("emptyDescription")}
                action={
                  <ButtonLink href={localeHref(locale, "/collections")} variant="outline">
                    {t("exploreOtherCollections")}
                  </ButtonLink>
                }
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
