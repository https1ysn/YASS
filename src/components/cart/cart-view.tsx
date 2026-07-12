"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useCartHydration, useCartStore } from "@/store/cart-store";
import { FLAT_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from "@/constants/cart";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";
import { EmptyCart } from "./empty-cart";
import { SavedForLater } from "./saved-for-later";
import { ContinueShopping } from "./continue-shopping";

/**
 * Cart page orchestrator, backed by the persisted cart store. Coupons remain
 * visual only — checkout recomputes real totals on the server.
 */
export function CartView() {
  const t = useTranslations("cart");
  useCartHydration();
  const lines = useCartStore((state) => state.lines);
  const saved = useCartStore((state) => state.saved);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const saveForLater = useCartStore((state) => state.saveForLater);
  const moveToBag = useCartStore((state) => state.moveToBag);
  const removeSaved = useCartStore((state) => state.removeSaved);

  const [coupon, setCoupon] = React.useState<string | null>(null);

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const discount = coupon ? Math.round(subtotal * 0.1) : 0;
  const shipping =
    lines.length === 0 || subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;

  function remove(id: string) {
    const line = lines.find((l) => l.id === id);
    removeLine(id);
    if (line) toast({ title: t("view.removedFromBag"), description: line.product.name });
  }

  function save(id: string) {
    const line = lines.find((l) => l.id === id);
    if (!line) return;
    saveForLater(id);
    toast({ title: t("view.savedForLater"), description: line.product.name, variant: "success" });
  }

  function backToBag(id: string) {
    const line = saved.find((l) => l.id === id);
    if (!line) return;
    moveToBag(id);
    toast({ title: t("view.movedToBag"), description: line.product.name, variant: "success" });
  }

  return (
    <div className="flex flex-col gap-14 sm:gap-16">
      {lines.length > 0 ? (
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
          <div className="flex flex-col">
            <ul className="divide-border border-border divide-y border-y">
              {lines.map((line) => (
                <CartItem
                  key={line.id}
                  line={line}
                  onQuantityChange={setQuantity}
                  onRemove={remove}
                  onSaveForLater={save}
                />
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <ContinueShopping />
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => toast({ title: t("view.cartUpdated") })}
              >
                {t("view.updateCart")}
              </Button>
            </div>
          </div>

          <CartSummary
            subtotal={subtotal}
            discount={discount}
            shipping={shipping}
            appliedCoupon={coupon}
            onApplyCoupon={setCoupon}
            onClearCoupon={() => setCoupon(null)}
            className="lg:sticky lg:top-28"
          />
        </div>
      ) : (
        <EmptyCart />
      )}

      <SavedForLater lines={saved} onMoveToBag={backToBag} onRemove={removeSaved} />
    </div>
  );
}
