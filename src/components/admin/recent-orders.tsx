import * as React from "react";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { AdminRecentOrder } from "@/lib/supabase/admin";

const statusVariant: Record<string, BadgeProps["variant"]> = {
  pending: "warning",
  confirmed: "secondary",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** The five most recent orders. */
export function RecentOrders({ orders }: { orders: AdminRecentOrder[] }) {
  return (
    <Card className="animate-fade-in flex flex-col gap-4 p-5 sm:p-6">
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">Recent orders</h2>

      {orders.length === 0 ? (
        <p className="border-border bg-surface/50 text-muted rounded-xl border border-dashed px-4 py-8 text-center text-sm">
          No orders yet — they&apos;ll appear here as soon as the first one is placed.
        </p>
      ) : (
        <ul className="divide-border divide-y">
          {orders.map((order) => (
            <li
              key={order.order_number}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-3.5"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-sm font-semibold tracking-tight">{order.order_number}</p>
                <p className="text-muted truncate text-xs">
                  {order.customer_name} · {order.shipping_city} · {order.item_count}{" "}
                  {order.item_count === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={statusVariant[order.status] ?? "muted"}
                  className="px-2.5 py-0.5 text-[10px]"
                >
                  {order.status}
                </Badge>
                <div className="flex flex-col items-end gap-0.5">
                  <p className="text-sm font-semibold whitespace-nowrap">
                    {formatPrice(Number(order.total))}
                  </p>
                  <p className="text-muted text-[11px]">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
