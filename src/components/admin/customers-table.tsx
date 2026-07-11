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
import type { AdminCustomerListItem } from "@/lib/supabase/admin";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/** Admin customers table — scrolls horizontally on narrow screens. */
export function CustomersTable({ customers }: { customers: AdminCustomerListItem[] }) {
  return (
    <Card className="animate-fade-in overflow-hidden p-0">
      <Table className="min-w-210">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total spent</TableHead>
            <TableHead>Last order</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="max-w-44 truncate text-sm font-semibold underline-offset-4 hover:underline"
                >
                  {customer.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted text-sm whitespace-nowrap">
                {customer.phone}
              </TableCell>
              <TableCell className="text-muted max-w-48 truncate text-sm">
                {customer.email ?? "—"}
              </TableCell>
              <TableCell className="text-muted max-w-32 truncate text-sm">
                {customer.city ?? "—"}
              </TableCell>
              <TableCell className="text-sm">
                {customer.totalOrders} {customer.totalOrders === 1 ? "order" : "orders"}
              </TableCell>
              <TableCell className="text-sm font-semibold whitespace-nowrap">
                {formatPrice(customer.totalSpent)}
              </TableCell>
              <TableCell className="text-muted text-xs whitespace-nowrap">
                {formatDate(customer.lastOrderAt)}
              </TableCell>
              <TableCell className="text-muted text-xs whitespace-nowrap">
                {formatDate(customer.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    aria-label={`View customer ${customer.name}`}
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
