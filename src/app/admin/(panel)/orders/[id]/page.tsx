import type { Metadata } from "next";
import Image from "next/image";
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
import {
  formatPaymentMethod,
  OrderStatusBadge,
  OrderStatusControl,
} from "@/components/admin";
import { getAdminOrderById, type AdminOrderDetails } from "@/lib/supabase/admin";
import { filterColors } from "@/constants/shop";

export const metadata: Metadata = { title: "Order details" };

export const dynamic = "force-dynamic";

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function colorLabel(value: string | null) {
  if (!value) return null;
  return filterColors.find((color) => color.value === value)?.label ?? value;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted shrink-0">{label}</span>
      <span className="text-right font-medium break-words">{children}</span>
    </div>
  );
}

function ItemsCard({ order }: { order: AdminOrderDetails }) {
  return (
    <Card className="animate-fade-in overflow-hidden p-0">
      <div className="p-5 pb-0 sm:p-6 sm:pb-0">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </h2>
      </div>
      <Table className="min-w-130">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit price</TableHead>
            <TableHead className="text-right">Line total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => {
            const color = colorLabel(item.color);
            const variant = [item.size, color].filter(Boolean).join(" · ");
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="border-border bg-surface-elevated relative aspect-[4/5] w-10 shrink-0 overflow-hidden rounded-lg border">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      {item.slug ? (
                        <Link
                          href={`/products/${item.slug}`}
                          className="truncate text-sm font-semibold underline-offset-4 hover:underline"
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        <p className="truncate text-sm font-semibold">{item.productName}</p>
                      )}
                      {variant && <p className="text-muted truncate text-xs">{variant}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted text-sm">{item.quantity}</TableCell>
                <TableCell className="text-muted text-sm whitespace-nowrap">
                  {formatPrice(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold whitespace-nowrap">
                  {formatPrice(item.unitPrice * item.quantity)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function SummaryCard({ order }: { order: AdminOrderDetails }) {
  return (
    <Card className="animate-fade-in flex flex-col gap-3 p-5 sm:p-6">
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">Summary</h2>
      <div className="flex flex-col gap-2.5">
        <InfoRow label="Subtotal">{formatPrice(order.subtotal)}</InfoRow>
        <InfoRow label="Shipping">
          {order.shippingCost === 0 ? "Complimentary" : formatPrice(order.shippingCost)}
        </InfoRow>
        {order.discount > 0 && <InfoRow label="Discount">−{formatPrice(order.discount)}</InfoRow>}
        <div className="border-border flex items-baseline justify-between border-t pt-3">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-lg font-semibold tracking-tight">{formatPrice(order.total)}</span>
        </div>
      </div>
    </Card>
  );
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  const result = await getAdminOrderById(id);

  if (result.ok && !result.order) notFound();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-2">
        <Link
          href="/admin/orders"
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
          Back to orders
        </Link>
        {result.ok && result.order && (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {result.order.orderNumber}
            </h1>
            <OrderStatusBadge status={result.order.status} />
          </div>
        )}
        {result.ok && result.order && (
          <p className="text-muted text-sm">Placed {formatDate(result.order.createdAt)}</p>
        )}
      </div>

      {!result.ok ? (
        <Alert variant="danger" title="Couldn't load the order">
          {result.error}
        </Alert>
      ) : result.order ? (
        <div className="grid items-start gap-4 sm:gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
            <ItemsCard order={result.order} />
            <SummaryCard order={result.order} />
          </div>

          <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
            <OrderStatusControl
              orderId={result.order.id}
              orderNumber={result.order.orderNumber}
              status={result.order.status}
            />

            <Card className="animate-fade-in flex flex-col gap-3 p-5 sm:p-6">
              <h2 className="text-base font-semibold tracking-tight sm:text-lg">Customer</h2>
              <div className="flex flex-col gap-2.5">
                <InfoRow label="Name">{result.order.customer.name}</InfoRow>
                <InfoRow label="Phone">{result.order.customer.phone}</InfoRow>
                {result.order.customer.email && (
                  <InfoRow label="Email">{result.order.customer.email}</InfoRow>
                )}
                <InfoRow label="Address">{result.order.shippingStreet}</InfoRow>
                <InfoRow label="City">{result.order.shippingCity}</InfoRow>
                {result.order.shippingPostal && (
                  <InfoRow label="Postal code">{result.order.shippingPostal}</InfoRow>
                )}
                <InfoRow label="Country">{result.order.shippingCountry}</InfoRow>
              </div>
            </Card>

            <Card className="animate-fade-in flex flex-col gap-3 p-5 sm:p-6">
              <h2 className="text-base font-semibold tracking-tight sm:text-lg">Order</h2>
              <div className="flex flex-col gap-2.5">
                <InfoRow label="Order number">{result.order.orderNumber}</InfoRow>
                <InfoRow label="Date">{formatDate(result.order.createdAt)}</InfoRow>
                <InfoRow label="Payment">
                  {formatPaymentMethod(result.order.paymentMethod)}
                </InfoRow>
                <InfoRow label="Shipping">
                  {result.order.shippingMethod === "express" ? "Express" : "Standard"}
                </InfoRow>
                <InfoRow label="Status">
                  <OrderStatusBadge status={result.order.status} />
                </InfoRow>
              </div>
              {result.order.notes && (
                <div className="border-border flex flex-col gap-1.5 border-t pt-3">
                  <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
                    Notes
                  </p>
                  <p className="text-sm leading-relaxed break-words">{result.order.notes}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
