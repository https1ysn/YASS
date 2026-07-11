"use client";

import * as React from "react";
import type { Product } from "@/types/product";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { BagIcon } from "@/components/layout/icons";
import { FiltersProvider } from "./filters-context";
import { ProductToolbar } from "./product-toolbar";
import { ActiveFilters } from "./active-filters";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";

export interface ProductBrowserProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * The full browsing shell: toolbar, refinement sidebar (drawer on mobile),
 * active-filter chips, product grid and pagination. UI only — refinements do
 * not filter the static catalog yet.
 */
export function ProductBrowser({
  products,
  emptyTitle = "This collection is arriving soon",
  emptyDescription = "Our ateliers are putting the final touches on these pieces. Leave your email in the newsletter below to be first to know.",
}: ProductBrowserProps) {
  return (
    <FiltersProvider>
      <Container>
        <div className="flex flex-col gap-6 py-8 sm:py-12">
          <ProductToolbar count={products.length} />
          <ActiveFilters />

          <div className="grid items-start gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
            <aside aria-label="Product filters" className="sticky top-28 hidden lg:block">
              <ProductFilters />
            </aside>

            <div>
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
                  title={emptyTitle}
                  description={emptyDescription}
                  action={
                    <ButtonLink href="/collections" variant="outline">
                      Explore other collections
                    </ButtonLink>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </FiltersProvider>
  );
}
