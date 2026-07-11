import type { Metadata } from "next";
import { formatPrice } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { BestSellersPanel, RecentOrders, StatCard } from "@/components/admin";
import { getAdminDashboardStats } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Overview" };

// Always fresh — the admin should never see stale numbers.
export const dynamic = "force-dynamic";

function StatIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      {children}
    </svg>
  );
}

export default async function AdminOverviewPage() {
  const result = await getAdminDashboardStats();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
        <p className="text-muted text-sm">The maison at a glance — live from the database.</p>
      </div>

      {!result.ok ? (
        <Alert variant="danger" title="Couldn't load the dashboard">
          {result.error}
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <StatCard
              label="Products"
              value={String(result.stats.totalProducts)}
              icon={
                <StatIcon>
                  <path d="M5.3 7h9.4l-.66 8.13a1.75 1.75 0 0 1-1.74 1.62H7.7a1.75 1.75 0 0 1-1.74-1.62L5.3 7Z" />
                  <path d="M7.5 7V5.75a2.5 2.5 0 0 1 5 0V7" />
                </StatIcon>
              }
            />
            <StatCard
              label="Categories"
              value={String(result.stats.totalCategories)}
              icon={
                <StatIcon>
                  <path d="M3.5 8.5v-4a1 1 0 0 1 1-1h4l8 8-5 5-8-8Z" />
                  <circle cx="7" cy="7" r="1" />
                </StatIcon>
              }
            />
            <StatCard
              label="Customers"
              value={String(result.stats.totalCustomers)}
              icon={
                <StatIcon>
                  <circle cx="10" cy="6.75" r="3" />
                  <path d="M4.75 16.25a5.25 5.25 0 0 1 10.5 0" />
                </StatIcon>
              }
            />
            <StatCard
              label="Orders"
              value={String(result.stats.totalOrders)}
              icon={
                <StatIcon>
                  <path d="M5 3.5h10v13l-2.5-1.5L10 16.5l-2.5-1.5L5 16.5v-13Z" />
                  <path d="M7.5 7.5h5M7.5 10.5h5" />
                </StatIcon>
              }
            />
            <StatCard
              label="Revenue"
              value={formatPrice(result.stats.totalRevenue)}
              hint="Excluding cancelled orders"
              icon={
                <StatIcon>
                  <path d="M3.5 15.5 8 11l3 3 5.5-5.5" />
                  <path d="M12.5 8.5h4v4" />
                </StatIcon>
              }
            />
          </div>

          <div className="grid items-start gap-4 sm:gap-6 xl:grid-cols-[1.4fr_1fr]">
            <RecentOrders orders={result.stats.recentOrders} />
            <BestSellersPanel products={result.stats.bestSellers} />
          </div>
        </>
      )}
    </div>
  );
}
