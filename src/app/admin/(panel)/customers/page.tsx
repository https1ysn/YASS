import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { CustomersTable, CustomersToolbar, ProductsPagination } from "@/components/admin";
import { getAdminCustomers, type AdminCustomerSort } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Customers" };

// Admin lists must always be fresh.
export const dynamic = "force-dynamic";

interface AdminCustomersPageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

const SORTS: AdminCustomerSort[] = ["newest", "oldest", "orders-desc", "spent-desc", "name"];

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  const params = await searchParams;
  const sort = SORTS.includes(params.sort as AdminCustomerSort)
    ? (params.sort as AdminCustomerSort)
    : "newest";
  const page = Math.max(1, Number(params.page) || 1);

  const result = await getAdminCustomers({ q: params.q, sort, page });

  const hasFilters = Boolean(params.q);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Customers</h1>
        <p className="text-muted text-sm">
          {result.ok
            ? `${result.total} ${result.total === 1 ? "client" : "clients"} of the maison.`
            : "Manage the maison's clients."}
        </p>
      </div>

      {!result.ok ? (
        <Alert variant="danger" title="Couldn't load customers">
          {result.error}
        </Alert>
      ) : (
        <>
          <CustomersToolbar />

          {result.customers.length === 0 ? (
            <EmptyState
              title={hasFilters ? "No customers match" : "No customers yet"}
              description={
                hasFilters
                  ? "Try a different search or clear it."
                  : "Customers appear here as soon as the first order is placed at checkout."
              }
              action={
                hasFilters ? (
                  <ButtonLink href="/admin/customers" variant="outline">
                    Clear search
                  </ButtonLink>
                ) : undefined
              }
            />
          ) : (
            <>
              <CustomersTable customers={result.customers} />
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
