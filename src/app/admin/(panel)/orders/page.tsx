import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { OrdersTable, OrdersToolbar, ProductsPagination } from "@/components/admin";
import { getAdminOrders, isOrderStatus, type AdminOrderSort } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Orders" };

// Admin lists must always be fresh.
export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<{ q?: string; status?: string; sort?: string; page?: string }>;
}

const SORTS: AdminOrderSort[] = ["newest", "oldest", "total-desc", "total-asc"];

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const sort = SORTS.includes(params.sort as AdminOrderSort)
    ? (params.sort as AdminOrderSort)
    : "newest";
  const status = params.status && isOrderStatus(params.status) ? params.status : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const result = await getAdminOrders({ q: params.q, status, sort, page });

  const hasFilters = Boolean(params.q || status);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders</h1>
        <p className="text-muted text-sm">
          {result.ok
            ? `${result.total} ${result.total === 1 ? "order" : "orders"} placed with the maison.`
            : "Manage the maison's orders."}
        </p>
      </div>

      {!result.ok ? (
        <Alert variant="danger" title="Couldn't load orders">
          {result.error}
        </Alert>
      ) : (
        <>
          <OrdersToolbar />

          {result.orders.length === 0 ? (
            <EmptyState
              title={hasFilters ? "No orders match" : "No orders yet"}
              description={
                hasFilters
                  ? "Try a different search or clear the filters."
                  : "Orders appear here as soon as the first one is placed at checkout."
              }
              action={
                hasFilters ? (
                  <ButtonLink href="/admin/orders" variant="outline">
                    Clear filters
                  </ButtonLink>
                ) : undefined
              }
            />
          ) : (
            <>
              <OrdersTable orders={result.orders} />
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
