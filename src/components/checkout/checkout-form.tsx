"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { EmptyCart } from "@/components/cart";
import { useCartHydration, useCartStore } from "@/store/cart-store";
import { placeOrder } from "@/app/(store)/checkout/actions";
import { FLAT_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from "@/constants/cart";
import { shippingMethods } from "@/constants/checkout";
import { ContactInformation } from "./contact-information";
import { ShippingAddress } from "./shipping-address";
import { ShippingMethod } from "./shipping-method";
import { PaymentMethod } from "./payment-method";
import { OrderNotes } from "./order-notes";
import { CheckoutOrderSummary } from "./checkout-order-summary";

function SectionCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="animate-fade-in flex flex-col gap-6 p-6 sm:p-8">
      <div className="flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className="bg-secondary/15 text-secondary grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold"
        >
          {String(step).padStart(2, "0")}
        </span>
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

/**
 * Checkout orchestrator. Reads the live cart, validates natively, then places
 * a real order through the `placeOrder` server action; on success the cart is
 * cleared and the shopper lands on the confirmation page.
 */
export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useCartHydration();
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clearCart);

  const [shippingMethod, setShippingMethod] = React.useState("standard");
  const [paymentMethod, setPaymentMethod] = React.useState("cod");
  const [coupon, setCoupon] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [placed, setPlaced] = React.useState(false);

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const discount = coupon ? Math.round(subtotal * 0.1) : 0;
  const express = shippingMethods.find((m) => m.id === "express");
  const shipping =
    shippingMethod === "express"
      ? (express?.price ?? 0)
      : subtotal - discount >= FREE_SHIPPING_THRESHOLD
        ? 0
        : FLAT_SHIPPING_RATE;
  const total = subtotal - discount + shipping;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (lines.length === 0) {
      toast({ title: "Your bag is empty", variant: "warning" });
      return;
    }

    const form = new FormData(event.currentTarget);
    setSubmitting(true);

    try {
      const result = await placeOrder({
        fullName: String(form.get("fullName") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        country: String(form.get("country") ?? ""),
        city: String(form.get("city") ?? ""),
        street: String(form.get("street") ?? ""),
        postalCode: String(form.get("postalCode") ?? ""),
        shippingMethod: shippingMethod === "express" ? "express" : "standard",
        paymentMethod: "cod",
        notes: String(form.get("orderNotes") ?? ""),
        coupon,
        items: lines.map((line) => ({
          slug: line.product.slug,
          size: line.size,
          color: line.color,
          quantity: line.quantity,
        })),
      });

      if (!result.ok) {
        toast({
          title: "We couldn't place your order",
          description: result.error,
          variant: "danger",
        });
        setSubmitting(false);
        return;
      }

      setPlaced(true);
      toast({
        title: "Order placed",
        description: `${result.orderNumber} — thank you, it's on its way.`,
        variant: "success",
      });
      router.push(
        `/checkout/confirmation?order=${encodeURIComponent(result.orderNumber)}&method=${shippingMethod}`
      );
      clearCart();
    } catch {
      toast({
        title: "We couldn't place your order",
        description: "Please check your connection and try again.",
        variant: "danger",
      });
      setSubmitting(false);
    }
  }

  if (hydrated && lines.length === 0 && !placed) {
    return <EmptyCart />;
  }

  return (
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1fr_420px] lg:gap-14">
      <div className="order-2 flex flex-col gap-5 sm:gap-6 lg:order-1">
        <SectionCard step={1} title="Contact information">
          <ContactInformation />
        </SectionCard>
        <SectionCard step={2} title="Shipping address">
          <ShippingAddress />
        </SectionCard>
        <SectionCard step={3} title="Shipping method">
          <ShippingMethod value={shippingMethod} onChange={setShippingMethod} />
        </SectionCard>
        <SectionCard step={4} title="Payment method">
          <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />
        </SectionCard>
        <SectionCard step={5} title="Order notes">
          <OrderNotes />
        </SectionCard>

        <div className="flex flex-col gap-2.5 pt-1">
          <Button type="submit" size="lg" fullWidth isLoading={submitting}>
            {submitting ? "Placing your order…" : `Place order · ${formatPrice(total)}`}
          </Button>
          <p className="text-muted text-center text-xs leading-relaxed">
            By placing your order you agree to our terms · Nothing is charged today — pay on
            delivery.
          </p>
        </div>
      </div>

      <CheckoutOrderSummary
        lines={lines}
        subtotal={subtotal}
        discount={discount}
        shipping={shipping}
        appliedCoupon={coupon}
        onApplyCoupon={setCoupon}
        onClearCoupon={() => setCoupon(null)}
        className="order-1 lg:sticky lg:top-28 lg:order-2"
      />
    </form>
  );
}
