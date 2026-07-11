import * as React from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { AdminBestSeller } from "@/lib/supabase/admin";

/** Best-selling products ranked by units sold (from real order items). */
export function BestSellersPanel({ products }: { products: AdminBestSeller[] }) {
  const maxUnits = Math.max(1, ...products.map((product) => product.units_sold));

  return (
    <Card className="animate-fade-in flex flex-col gap-4 p-5 sm:p-6">
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">Best sellers</h2>

      {products.length === 0 ? (
        <p className="border-border bg-surface/50 text-muted rounded-xl border border-dashed px-4 py-8 text-center text-sm">
          No sales yet — best sellers appear once orders come in.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {products.map((product) => (
            <li key={product.product_name} className="flex items-center gap-3.5">
              <span className="border-border bg-surface-elevated relative aspect-[4/5] w-11 shrink-0 overflow-hidden rounded-lg border">
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.product_name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium">{product.product_name}</p>
                  <p className="text-muted text-xs whitespace-nowrap">
                    {product.units_sold} {product.units_sold === 1 ? "unit" : "units"} ·{" "}
                    <span className="text-foreground font-semibold">
                      {formatPrice(Number(product.revenue))}
                    </span>
                  </p>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={product.units_sold}
                  aria-valuemin={0}
                  aria-valuemax={maxUnits}
                  aria-label={`${product.product_name} units sold`}
                  className="bg-foreground/10 h-1 overflow-hidden rounded-full"
                >
                  <div
                    className="bg-secondary ease-luxury h-full rounded-full transition-all duration-500"
                    style={{ width: `${(product.units_sold / maxUnits) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
