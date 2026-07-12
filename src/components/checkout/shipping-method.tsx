"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import { shippingMethods } from "@/constants/checkout";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";
import { OptionCard } from "./option-card";

export interface ShippingMethodProps {
  value: string;
  onChange: (value: string) => void;
}

export function ShippingMethod({ value, onChange }: ShippingMethodProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("checkout.shippingMethodSection");
  const tMethods = useTranslations("shippingMethods");

  return (
    <div role="radiogroup" aria-label={t("ariaLabel")} className="flex flex-col gap-3">
      {shippingMethods.map((method) => (
        <OptionCard
          key={method.id}
          name="shippingMethod"
          value={method.id}
          checked={value === method.id}
          onChange={onChange}
          label={tMethods(`${method.id}.label`)}
          description={tMethods(`${method.id}.description`)}
          meta={
            method.price === 0
              ? t("complimentary")
              : formatPrice(method.price, "USD", intlTagByLocale[locale])
          }
        />
      ))}
    </div>
  );
}
