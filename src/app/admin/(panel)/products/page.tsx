import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductsPagination, ProductsTable, ProductsToolbar } from "@/components/admin";
import { getAdminCategories, getAdminProducts, type AdminProductSort } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Products" };

// Admin lists must always be fresh.
export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}

const SORTS: AdminProductSort[] = ["newest", "oldest", "name", "price-desc", "price-asc"];

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const sort = SORTS.includes(params.sort as AdminProductSort)
    ? (params.sort as AdminProductSort)
    : "newest";
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, result] = await Promise.all([
    getAdminCategories(),
    getAdminProducts({ q: params.q, category: params.category, sort, page }),
  ]);

  const hasFilters = Boolean(params.q || params.category);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="animate-slide-up flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Products</h1>
          <p className="text-muted text-sm">
            {result.ok
              ? `${result.total} ${result.total === 1 ? "piece" : "pieces"} in the catalog.`
              : "Manage the catalog."}
          </p>
        </div>
        <ButtonLink href="/admin/products/new">New product</ButtonLink>
      </div>

      {!result.ok ? (
        <Alert variant="danger" title="Couldn't load products">
          {result.error}
        </Alert>
      ) : (
        <>
          <ProductsToolbar categories={categories} />

          {result.products.length === 0 ? (
            <EmptyState
              title={hasFilters ? "No products match" : "No products yet"}
              description={
                hasFilters
                  ? "Try a different search or clear the filters."
                  : "Create your first product to start building the catalog."
              }
              action={
                hasFilters ? (
                  <ButtonLink href="/admin/products" variant="outline">
                    Clear filters
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/admin/products/new">New product</ButtonLink>
                )
              }
            />
          ) : (
            <>
              <ProductsTable products={result.products} />
              {result.totalPages > 1 && (
                <ProductsPagination page={result.page} totalPages={result.totalPages} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
