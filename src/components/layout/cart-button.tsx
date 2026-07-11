"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MiniCartDrawer } from "@/components/cart/mini-cart";
import { useCartHydration, useCartStore } from "@/store/cart-store";
import { BagIcon, iconActionClasses } from "./icons";

export interface CartButtonProps {
  className?: string;
}

/** Header bag icon — opens the mini cart with the live cart contents. */
export function CartButton({ className }: CartButtonProps) {
  const [open, setOpen] = React.useState(false);
  useCartHydration();
  const lines = useCartStore((state) => state.lines);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={count > 0 ? `Shopping bag, ${count} items` : "Shopping bag"}
        className={cn(iconActionClasses, "-mr-2 sm:mr-0", className)}
      >
        <BagIcon />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="bg-secondary text-secondary-foreground absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full text-[10px] font-semibold"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <MiniCartDrawer open={open} onClose={() => setOpen(false)} lines={lines} />
    </>
  );
}
