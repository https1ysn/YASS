import * as React from "react";
import Image from "next/image";
import Link from "next/link";
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
import type { AdminCategoryDetails } from "@/lib/supabase/admin";
import { CategoryRowActions } from "./category-row-actions";

/** Admin categories table — scrolls horizontally on narrow screens. */
export function CategoriesTable({ categories }: { categories: AdminCategoryDetails[] }) {
  return (
    <Card className="animate-fade-in overflow-hidden p-0">
      <Table className="min-w-180">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Category</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Sort order</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="border-border bg-surface-elevated relative aspect-[4/5] w-10 shrink-0 overflow-hidden rounded-lg border">
                    {category.imageUrl && (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="truncate text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    {category.name}
                  </Link>
                </div>
              </TableCell>
              <TableCell className="text-muted text-sm whitespace-nowrap">
                {category.slug}
              </TableCell>
              <TableCell className="text-muted max-w-64 truncate text-sm">
                {category.description || "—"}
              </TableCell>
              <TableCell className="text-sm">
                {category.productCount} {category.productCount === 1 ? "piece" : "pieces"}
              </TableCell>
              <TableCell className="text-muted text-sm">{category.sortOrder}</TableCell>
              <TableCell>
                <Badge
                  variant={category.isComingSoon ? "warning" : "success"}
                  className="px-2.5 py-0.5 text-[10px]"
                >
                  {category.isComingSoon ? "Coming soon" : "Live"}
                </Badge>
              </TableCell>
              <TableCell>
                <CategoryRowActions
                  id={category.id}
                  name={category.name}
                  productCount={category.productCount}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
