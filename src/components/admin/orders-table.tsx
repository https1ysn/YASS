import * as React from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminOrderListItem } from "@/lib/supabase/admin";
import { formatPaymentMethod, OrderStatusBadge } from "./order-status-badge";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/** Admin orders table — scrolls horizontally on narrow screens. */
export function OrdersTable({ orders }: { orders: AdminOrderListItem[] }) {
  return (
    <Card className="animate-fade-in overflow-hidden p-0">
      <Table className="min-w-210">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-sm font-semibold whitespace-nowrap underline-offset-4 hover:underline"
                >
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="max-w-40 truncate text-sm">{order.customerName}</TableCell>
              <TableCell className="text-muted text-sm whitespace-nowrap">{order.phone}</TableCell>
              <TableCell className="text-muted max-w-32 truncate text-sm">{order.city}</TableCell>
              <TableCell className="text-sm font-semibold whitespace-nowrap">
                {formatPrice(order.total)}
              </TableCell>
              <TableCell className="text-muted text-sm whitespace-nowrap">
                {formatPaymentMethod(order.paymentMethod)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-muted text-sm">
                {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
              </TableCell>
              <TableCell className="text-muted text-xs whitespace-nowrap">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    aria-label={`View order ${order.orderNumber}`}
                    className={cn(
                      "text-muted grid size-9 place-items-center rounded-xl transition-colors",
                      "hover:bg-foreground/5 hover:text-foreground",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
                    )}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4.5"
                    >
                      <path d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" />
                    </svg>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
