"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ORDER_STATUSES } from "@/lib/order-status";

/** Search, status filter and sort — all driven by URL search params. */
export function OrdersToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");

  const setParams = React.useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Debounced text search.
  React.useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (q === current) return;
    const timer = setTimeout(() => setParams({ q }), 350);
    return () => clearTimeout(timer);
  }, [q, searchParams, setParams]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <Input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search by order number, customer or phone…"
          aria-label="Search orders by order number, customer or phone"
          className="h-10 rounded-xl"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:w-auto">
        <div className="sm:w-44">
          <Select
            aria-label="Filter by status"
            value={searchParams.get("status") ?? ""}
            onChange={(event) => setParams({ status: event.target.value })}
            className="h-10 rounded-xl text-sm"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:w-44">
          <Select
            aria-label="Sort orders"
            value={searchParams.get("sort") ?? "newest"}
            onChange={(event) => setParams({ sort: event.target.value })}
            className="h-10 rounded-xl text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="total-desc">Total: High to Low</option>
            <option value="total-asc">Total: Low to High</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
