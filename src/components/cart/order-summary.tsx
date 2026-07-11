import * as React from "react";
import { cn, formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/cart";

export interface OrderSummaryProps {
  subtotal: number;
  discount?: number;
  discountCode?: string | null;
  /** 0 means complimentary shipping. */
  shipping: number;
  className?: string;
}

/** Subtotal / discount / shipping / total rows with a free-shipping meter. */
export function OrderSummary({
  subtotal,
  discount = 0,
  discountCode,
  shipping,
  className,
}: OrderSummaryProps) {
  const total = subtotal - discount + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - (subtotal - discount));
  const progress = Math.min(100, ((subtotal - discount) / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <dl className="flex flex-col gap-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">
              Discount{discountCode && <span className="ml-1.5 text-xs">({discountCode})</span>}
            </dt>
            <dd className="text-success font-medium">−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Shipping</dt>
          <dd className={cn("font-medium", shipping === 0 && "text-success")}>
            {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
          </dd>
        </div>
      </dl>

      <div className="bg-foreground/[0.04] flex flex-col gap-2 rounded-xl p-3.5">
        <p className="text-muted text-xs leading-relaxed">
          {remaining > 0 ? (
            <>
              Add <span className="text-foreground font-semibold">{formatPrice(remaining)}</span>{" "}
              more for complimentary shipping.
            </>
          ) : (
            <span className="text-success font-medium">
              You&apos;ve unlocked complimentary shipping.
            </span>
          )}
        </p>
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress toward complimentary shipping"
          className="bg-foreground/10 h-1 overflow-hidden rounded-full"
        >
          <div
            className="bg-secondary ease-luxury h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="border-border flex items-baseline justify-between gap-4 border-t pt-4">
        <p className="text-base font-semibold">Total</p>
        <p className="text-xl font-bold tracking-tight">{formatPrice(total)}</p>
      </div>
    </div>
  );
}
