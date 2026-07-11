"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

/** Search and sort — all driven by URL search params. */
export function CustomersToolbar() {
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
          placeholder="Search by name, phone or email…"
          aria-label="Search customers by name, phone or email"
          className="h-10 rounded-xl"
        />
      </div>
      <div className="sm:w-44">
        <Select
          aria-label="Sort customers"
          value={searchParams.get("sort") ?? "newest"}
          onChange={(event) => setParams({ sort: event.target.value })}
          className="h-10 rounded-xl text-sm"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="orders-desc">Most orders</option>
          <option value="spent-desc">Highest spending</option>
          <option value="name">Name A–Z</option>
        </Select>
      </div>
    </div>
  );
}
