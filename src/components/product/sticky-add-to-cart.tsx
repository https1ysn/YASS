"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useCartStore } from "@/store/cart-store";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";

/** Mobile-only sticky bar that appears once the main actions scroll away. */
export function StickyAddToCart({ product }: { product: Product }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("product.stickyAddToCart");
  const addLine = useCartStore((state) => state.addLine);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "glass border-border ease-luxury fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="border-border relative aspect-[4/5] w-11 shrink-0 overflow-hidden rounded-lg border">
          <Image src={product.imageSrc} alt="" fill sizes="44px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-semibold">{product.name}</p>
          <p className="text-muted text-sm">
            {formatPrice(product.price, "USD", intlTagByLocale[locale])}
          </p>
        </div>
        <Button
          size="sm"
          tabIndex={visible ? undefined : -1}
          className="h-11 px-5"
          onClick={() => {
            const size = product.sizes[0];
            addLine(product, { size, color: product.colors[0] ?? "" });
            toast({
              title: t("addedToBag"),
              description: t("addedToBagDescription", { name: product.name, size }),
              variant: "success",
            });
          }}
        >
          {t("addToBag")}
        </Button>
      </div>
    </div>
  );
}
