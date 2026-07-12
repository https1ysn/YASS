"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { MiniCartDrawer } from "@/components/cart/mini-cart";
import { useCartHydration, useCartStore } from "@/store/cart-store";
import { BagIcon, iconActionClasses } from "./icons";

export interface CartButtonProps {
  className?: string;
}

/** Header bag icon — opens the mini cart with the live cart contents. */
export function CartButton({ className }: CartButtonProps) {
  const t = useTranslations("cartButton");
  const [open, setOpen] = React.useState(false);
  useCartHydration();
  const lines = useCartStore((state) => state.lines);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={count > 0 ? t("shoppingBagCount", { count }) : t("shoppingBag")}
        className={cn(iconActionClasses, "-mr-2 sm:mr-0 rtl:mr-0 rtl:-ml-2 sm:rtl:ml-0", className)}
      >
        <BagIcon />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="bg-secondary text-secondary-foreground absolute top-1.5 end-1.5 grid size-4 place-items-center rounded-full text-[10px] font-semibold"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <MiniCartDrawer open={open} onClose={() => setOpen(false)} lines={lines} />
    </>
  );
}
