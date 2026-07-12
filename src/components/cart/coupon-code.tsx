"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ChevronDownIcon } from "@/components/layout/icons";

export interface CouponCodeProps {
  appliedCode: string | null;
  onApply: (code: string) => void;
  onClear: () => void;
}

/** Coupon input — UI only; any code "applies" a demo discount. */
export function CouponCode({ appliedCode, onApply, onClear }: CouponCodeProps) {
  const t = useTranslations("cart.coupon");
  const [code, setCode] = React.useState("");

  // No nested <form> here — this component also renders inside the checkout form.
  function apply() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    onApply(trimmed);
    setCode("");
    toast({
      title: t("couponApplied"),
      description: t("couponAppliedDescription", { code: trimmed }),
      variant: "success",
    });
  }

  return (
    <details className="group border-border border-t">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium tracking-wide select-none [&::-webkit-details-marker]:hidden">
        {t("addCoupon")}
        <ChevronDownIcon className="text-muted size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="animate-fade-in pb-4">
        {appliedCode ? (
          <div className="bg-success/10 flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5">
            <p className="text-success text-sm font-medium">
              {t("appliedCode", { code: appliedCode })}
            </p>
            <button
              type="button"
              onClick={onClear}
              className="text-muted hover:text-danger text-xs font-medium underline-offset-4 transition-colors hover:underline"
            >
              {t("remove")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  apply();
                }
              }}
              placeholder={t("placeholder")}
              aria-label={t("ariaLabel")}
              className="border-border bg-surface-elevated placeholder:text-muted focus:border-secondary focus:ring-secondary/25 h-10 w-full flex-1 rounded-xl border px-3.5 text-sm tracking-wide uppercase transition-all placeholder:normal-case focus:ring-2 focus:outline-none"
            />
            <Button
              type="button"
              onClick={apply}
              variant="outline"
              size="sm"
              className="h-10 rounded-xl"
            >
              {t("apply")}
            </Button>
          </div>
        )}
      </div>
    </details>
  );
}
