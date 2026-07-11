"use client";

import * as React from "react";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/cart";
import { Card } from "@/components/ui/card";
import { OrderSummary } from "@/components/cart/order-summary";
import { CouponCode } from "@/components/cart/coupon-code";

export interface CheckoutOrderSummaryProps {
  lines: CartLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => void;
  onClearCoupon: () => void;
  className?: string;
}

/** Sidebar recap: line items, coupon and totals — reuses the cart summary rows. */
export function CheckoutOrderSummary({
  lines,
  subtotal,
  discount,
  shipping,
  appliedCoupon,
  onApplyCoupon,
  onClearCoupon,
  className,
}: CheckoutOrderSummaryProps) {
  return (
    <Card className={cn("flex flex-col gap-5 p-6 sm:p-8", className)}>
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Your order</h2>

      <ul className="divide-border border-border divide-y border-y">
        {lines.map((line) => (
          <li key={line.id} className="flex items-center gap-4 py-4">
            <span className="border-border bg-surface-elevated relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg border">
              <Image
                src={line.product.imageSrc}
                alt={line.product.imageAlt ?? line.product.name}
                fill
                sizes="56px"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="bg-primary text-primary-foreground absolute -top-0 -right-0 grid size-5 place-items-center rounded-bl-lg text-[10px] font-semibold"
              >
                {line.quantity}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">{line.product.name}</span>
              <span className="text-muted text-xs">
                Size {line.size} · Qty {line.quantity}
              </span>
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">
              {formatPrice(line.product.price * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <CouponCode appliedCode={appliedCoupon} onApply={onApplyCoupon} onClear={onClearCoupon} />

      <OrderSummary
        subtotal={subtotal}
        discount={discount}
        discountCode={appliedCoupon}
        shipping={shipping}
      />
    </Card>
  );
}
