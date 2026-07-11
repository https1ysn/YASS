"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/cart";
import { Button } from "@/components/ui/button";
import { filterColors } from "@/constants/shop";

export interface SavedForLaterProps {
  lines: CartLine[];
  onMoveToBag: (id: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

/** "Saved for later" list — UI only. */
export function SavedForLater({ lines, onMoveToBag, onRemove, className }: SavedForLaterProps) {
  if (lines.length === 0) return null;

  return (
    <section aria-label="Saved for later" className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
        Saved for later <span className="text-muted text-sm font-normal">({lines.length})</span>
      </h2>
      <ul className="divide-border divide-y">
        {lines.map((line) => {
          const colorLabel =
            filterColors.find((color) => color.value === line.color)?.label ?? line.color;
          return (
            <li key={line.id} className="animate-fade-in flex items-center gap-4 py-5 sm:gap-6">
              <Link
                href={line.product.href}
                aria-label={line.product.name}
                className="border-border bg-surface-elevated relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl border sm:w-20"
              >
                <Image
                  src={line.product.imageSrc}
                  alt={line.product.imageAlt ?? line.product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link
                  href={line.product.href}
                  className="truncate text-sm font-semibold underline-offset-4 hover:underline"
                >
                  {line.product.name}
                </Link>
                <p className="text-muted text-sm">
                  {colorLabel} · Size {line.size}
                </p>
                <p className="text-sm font-medium">{formatPrice(line.product.price)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMoveToBag(line.id)}
                  className="rounded-xl"
                >
                  Move to bag
                </Button>
                <button
                  type="button"
                  onClick={() => onRemove(line.id)}
                  className="text-muted hover:text-danger text-xs font-medium underline-offset-4 transition-colors hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
