import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge, StatCard } from "@/components/admin";
import { getAdminCustomerById, type AdminCustomerDetails } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Customer details" };

export const dynamic = "force-dynamic";

interface AdminCustomerPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(iso: string | null, withTime = false) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted shrink-0">{label}</span>
      <span className="text-right font-medium break-words">{children}</span>
    </div>
  );
}

function OrdersHistoryCard({ customer }: { customer: AdminCustomerDetails }) {
  return (
    <Card className="animate-fade-in overflow-hidden p-0">
      <div className="p-5 pb-0 sm:p-6 sm:pb-0">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">Order history</h2>
      </div>
      {customer.orders.length === 0 ? (
        <p className="text-muted p-5 pt-4 text-sm leading-relaxed sm:p-6 sm:pt-4">
          No orders yet — they&apos;ll appear here as soon as this client places one.
        </p>
      ) : (
        <Table className="min-w-120">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customer.orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-sm font-semibold whitespace-nowrap underline-offset-4 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-muted text-xs whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-muted text-sm">
                  {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold whitespace-nowrap">
                  {formatPrice(order.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

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

export default async function AdminCustomerPage({ params }: AdminCustomerPageProps) {
  const { id } = await params;
  const result = await getAdminCustomerById(id);

  if (result.ok && !result.customer) notFound();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-2">
        <Link
          href="/admin/customers"
          className="group text-muted hover:text-foreground flex w-fit items-center gap-2 text-sm font-medium transition-colors"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 transition-transform group-hover:-translate-x-1"
          >
            <path d="M16 10H4m0 0 4.5-4.5M4 10l4.5 4.5" />
          </svg>
          Back to customers
        </Link>
        {result.ok && result.customer && (
          <>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {result.customer.name}
            </h1>
            <p className="text-muted text-sm">
              Client since {formatDate(result.customer.createdAt)}
            </p>
          </>
        )}
      </div>

      {!result.ok ? (
        <Alert variant="danger" title="Couldn't load the customer">
          {result.error}
        </Alert>
      ) : result.customer ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <StatCard
              label="Orders"
              value={String(result.customer.stats.totalOrders)}
              hint={
                result.customer.stats.firstOrderAt
                  ? `First on ${formatDate(result.customer.stats.firstOrderAt)}`
                  : undefined
              }
              icon={
                <StatIcon>
                  <path d="M5 3.5h10v13l-2.5-1.5L10 16.5l-2.5-1.5L5 16.5v-13Z" />
                  <path d="M7.5 7.5h5M7.5 10.5h5" />
                </StatIcon>
              }
            />
            <StatCard
              label="Total spent"
              value={formatPrice(result.customer.stats.totalSpent)}
              hint="Excluding cancelled orders"
              icon={
                <StatIcon>
                  <path d="M3.5 15.5 8 11l3 3 5.5-5.5" />
                  <path d="M12.5 8.5h4v4" />
                </StatIcon>
              }
            />
            <StatCard
              label="Average order"
              value={formatPrice(result.customer.stats.averageOrder)}
              hint={
                result.customer.stats.lastOrderAt
                  ? `Last on ${formatDate(result.customer.stats.lastOrderAt)}`
                  : undefined
              }
              icon={
                <StatIcon>
                  <circle cx="10" cy="10" r="6.5" />
                  <path d="M10 6.75V10l2.25 2.25" />
                </StatIcon>
              }
            />
          </div>

          <div className="grid items-start gap-4 sm:gap-6 xl:grid-cols-[1.4fr_1fr]">
            <OrdersHistoryCard customer={result.customer} />

            <Card className="animate-fade-in flex min-w-0 flex-col gap-3 p-5 sm:p-6">
              <h2 className="text-base font-semibold tracking-tight sm:text-lg">Customer</h2>
              <div className="flex flex-col gap-2.5">
                <InfoRow label="Name">{result.customer.name}</InfoRow>
                <InfoRow label="Phone">{result.customer.phone}</InfoRow>
                {result.customer.email && (
                  <InfoRow label="Email">{result.customer.email}</InfoRow>
                )}
                {result.customer.address ? (
                  <>
                    <InfoRow label="Address">{result.customer.address.street}</InfoRow>
                    <InfoRow label="City">{result.customer.address.city}</InfoRow>
                    {result.customer.address.postal && (
                      <InfoRow label="Postal code">{result.customer.address.postal}</InfoRow>
                    )}
                    <InfoRow label="Country">{result.customer.address.country}</InfoRow>
                  </>
                ) : (
                  <InfoRow label="Address">—</InfoRow>
                )}
              </div>
              <p className="text-muted border-border border-t pt-3 text-xs leading-relaxed">
                The address reflects this client&apos;s most recent order.
              </p>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
