"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/types/product";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { BagIcon } from "@/components/layout/icons";
import { localeHref } from "@/i18n/alternates";
import type { AppLocale } from "@/i18n/routing";
import { ProductToolbar } from "./product-toolbar";
import { ProductGrid } from "./product-grid";

/** Divides evenly into the 2 / 3 / 4-column grid, so rows are always full. */
const PRODUCTS_PER_PAGE = 12;

export interface ProductBrowserProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * The browsing shell: product count + sort toolbar, a full-width product grid
 * and pagination. Paging is client-side and self-contained — the grid renders
 * one slice of `products` at a time.
 */
export function ProductBrowser({ products, emptyTitle, emptyDescription }: ProductBrowserProps) {
  const t = useTranslations("shop.browser");
  const tCommon = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const topRef = React.useRef<HTMLDivElement>(null);

  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));

  // Moving between collections swaps the list — start again from the first page.
  React.useEffect(() => {
    setPage(1);
  }, [products]);

  // Never render past the end if the list is shorter than the page we're on.
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = products.slice(start, start + PRODUCTS_PER_PAGE);

  function goToPage(next: number) {
    setPage(next);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <Container>
      <div ref={topRef} className="flex scroll-mt-28 flex-col gap-6 py-8 sm:py-12">
        <ProductToolbar count={products.length} />

        {products.length > 0 ? (
          <>
            <ProductGrid products={visibleProducts} />
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              navAriaLabel={tCommon("pagination")}
              previousLabel={tCommon("previousPage")}
              nextLabel={tCommon("nextPage")}
              pageLabel={(p) => tCommon("page", { number: p })}
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
    </Container>
  );
}
