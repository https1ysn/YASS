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

export interface ProductBrowserProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * The browsing shell: product count + sort toolbar, a full-width product grid
 * and pagination.
 */
export function ProductBrowser({ products, emptyTitle, emptyDescription }: ProductBrowserProps) {
  const t = useTranslations("shop.browser");
  const locale = useLocale() as AppLocale;

  return (
    <Container>
      <div className="flex flex-col gap-6 py-8 sm:py-12">
        <ProductToolbar count={products.length} />

        {products.length > 0 ? (
          <>
            <ProductGrid products={products} />
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
    </Container>
  );
}
