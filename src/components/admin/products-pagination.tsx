"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

/** URL-driven pagination that preserves the active search/filter/sort. */
export function ProductsPagination({
  page,
  totalPages,
  className,
}: {
  page: number;
  totalPages: number;
  className?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function createHref(target: number) {
    const params = new URLSearchParams(searchParams);
    if (target > 1) params.set("page", String(target));
    else params.delete("page");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <Pagination page={page} totalPages={totalPages} createHref={createHref} className={className} />
  );
}
