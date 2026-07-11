import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { CategoriesTable, CategoriesToolbar, ProductsPagination } from "@/components/admin";
import { getAdminCategoriesList, type AdminCategorySort } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Categories" };

// Admin lists must always be fresh.
export const dynamic = "force-dynamic";

interface AdminCategoriesPageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

const SORTS: AdminCategorySort[] = ["sort-order", "name", "newest", "oldest"];

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const params = await searchParams;
  const sort = SORTS.includes(params.sort as AdminCategorySort)
    ? (params.sort as AdminCategorySort)
    : "sort-order";
  const page = Math.max(1, Number(params.page) || 1);

  const result = await getAdminCategoriesList({ q: params.q, sort, page });

  const hasFilters = Boolean(params.q);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="animate-slide-up flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Categories</h1>
          <p className="text-muted text-sm">
            {result.ok
              ? `${result.total} ${result.total === 1 ? "world" : "worlds"} in the maison.`
              : "Manage the maison's collections."}
          </p>
        </div>
        <ButtonLink href="/admin/categories/new">New category</ButtonLink>
      </div>

      {!result.ok ? (
        <Alert variant="danger" title="Couldn't load categories">
          {result.error}
        </Alert>
      ) : (
        <>
          <CategoriesToolbar />

          {result.categories.length === 0 ? (
            <EmptyState
              title={hasFilters ? "No categories match" : "No categories yet"}
              description={
                hasFilters
                  ? "Try a different search or clear it."
                  : "Create your first category to start organizing the catalog."
              }
              action={
                hasFilters ? (
                  <ButtonLink href="/admin/categories" variant="outline">
                    Clear search
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/admin/categories/new">New category</ButtonLink>
                )
              }
            />
          ) : (
            <>
              <CategoriesTable categories={result.categories} />
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
