"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/cart";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { BagIcon } from "@/components/layout/icons";
import { filterColors } from "@/constants/shop";

export interface MiniCartDrawerProps {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
}

/** Compact bag drawer opened from the header — static placeholder contents. */
export function MiniCartDrawer({ open, onClose, lines }: MiniCartDrawerProps) {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={count > 0 ? `Shopping Bag (${count})` : "Shopping Bag"}
      footer={
        lines.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-base font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <ButtonLink href="/cart" variant="outline" fullWidth onClick={onClose}>
              View bag
            </ButtonLink>
            <ButtonLink href="/checkout" fullWidth onClick={onClose}>
              Checkout
            </ButtonLink>
            <p className="text-muted text-center text-xs">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        ) : undefined
      }
    >
      {lines.length > 0 ? (
        <ul className="divide-border divide-y">
          {lines.map((line) => {
            const colorLabel =
              filterColors.find((color) => color.value === line.color)?.label ?? line.color;
            return (
              <li key={line.id} className="animate-fade-in flex gap-4 py-4">
                <Link
                  href={line.product.href}
                  onClick={onClose}
                  aria-label={line.product.name}
                  className="border-border bg-surface-elevated relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl border"
                >
                  <Image
                    src={line.product.imageSrc}
                    alt={line.product.imageAlt ?? line.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Link
                    href={line.product.href}
                    onClick={onClose}
                    className="truncate text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    {line.product.name}
                  </Link>
                  <p className="text-muted text-xs">
                    {colorLabel} · Size {line.size}
                  </p>
                  <p className="text-muted mt-auto text-sm">
                    {line.quantity} ×{" "}
                    <span className="text-foreground">{formatPrice(line.product.price)}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
          <span className="bg-foreground/5 text-muted grid size-16 place-items-center rounded-full">
            <BagIcon className="size-7" />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="text-lg font-semibold tracking-tight">Your bag is empty</p>
            <p className="text-muted max-w-xs text-sm leading-relaxed">
              Discover our collections and add your favorite pieces.
            </p>
          </div>
          <Button onClick={onClose}>Continue shopping</Button>
        </div>
      )}
    </Drawer>
  );
}
