"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { OrderSummary } from "./order-summary";
import { CouponCode } from "./coupon-code";
import { ShippingEstimate } from "./shipping-estimate";

export interface CartSummaryProps {
  subtotal: number;
  discount: number;
  shipping: number;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => void;
  onClearCoupon: () => void;
  className?: string;
}

/** Sidebar card: order summary, coupon, shipping estimate and checkout CTA. */
export function CartSummary({
  subtotal,
  discount,
  shipping,
  appliedCoupon,
  onApplyCoupon,
  onClearCoupon,
  className,
}: CartSummaryProps) {
  return (
    <Card className={cn("flex flex-col gap-5 p-6 sm:p-8", className)}>
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Order summary</h2>

      <OrderSummary
        subtotal={subtotal}
        discount={discount}
        discountCode={appliedCoupon}
        shipping={shipping}
      />

      <div className="flex flex-col">
        <CouponCode appliedCode={appliedCoupon} onApply={onApplyCoupon} onClear={onClearCoupon} />
        <ShippingEstimate />
      </div>

      <div className="flex flex-col gap-2.5">
        <ButtonLink href="/checkout" size="lg" fullWidth>
          Proceed to checkout
        </ButtonLink>
        <p className="text-muted text-center text-xs leading-relaxed">
          Taxes calculated at checkout · Secure payment · 30-day returns
        </p>
      </div>
    </Card>
  );
}
