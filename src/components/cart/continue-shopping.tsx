"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@/components/layout/icons";

export interface ContinueShoppingProps {
  href?: string;
  label?: string;
  className?: string;
}

/** Quiet "keep browsing" link used under the cart line items. */
export function ContinueShopping({ href = "/shop", label, className }: ContinueShoppingProps) {
  const t = useTranslations("cart");

  return (
    <Link
      href={href}
      className={cn(
        "group text-foreground/80 hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors",
        className
      )}
    >
      <ArrowRightIcon className="size-4 rotate-180 rtl:rotate-0 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
      {label ?? t("continueShopping")}
    </Link>
  );
}
