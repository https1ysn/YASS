import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminProduct } from "@/lib/supabase/admin";
import { ProductRowActions } from "./product-row-actions";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/** Admin products table — scrolls horizontally on narrow screens. */
export function ProductsTable({ products }: { products: AdminProduct[] }) {
  return (
    <Card className="animate-fade-in overflow-hidden p-0">
      <Table className="min-w-170">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="border-border bg-surface-elevated relative aspect-[4/5] w-10 shrink-0 overflow-hidden rounded-lg border">
                    {product.imageUrl && (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="truncate text-sm font-semibold underline-offset-4 hover:underline"
                      >
                        {product.name}
                      </Link>
                      {product.badge && (
                        <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
                          {product.badge}
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted truncate text-xs">{product.slug}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted text-sm">{product.categoryName}</TableCell>
              <TableCell>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice != null && (
                    <s className="text-muted text-xs whitespace-nowrap">
                      {formatPrice(product.compareAtPrice)}
                    </s>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={product.availability === "in-stock" ? "success" : "warning"}
                  className="px-2.5 py-0.5 text-[10px]"
                >
                  {product.availability === "in-stock" ? "In stock" : "Made to order"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted text-xs whitespace-nowrap">
                {formatDate(product.createdAt)}
              </TableCell>
              <TableCell>
                <ProductRowActions id={product.id} name={product.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
