"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { paymentMethods } from "@/constants/checkout";
import { OptionCard } from "./option-card";

export interface PaymentMethodProps {
  value: string;
  onChange: (value: string) => void;
}

export function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  const t = useTranslations("checkout.paymentMethod");
  const tMethods = useTranslations("paymentMethods");

  return (
    <div role="radiogroup" aria-label={t("ariaLabel")} className="flex flex-col gap-3">
      {paymentMethods.map((method) => (
        <OptionCard
          key={method.id}
          name="paymentMethod"
          value={method.id}
          checked={value === method.id}
          onChange={onChange}
          label={tMethods(`${method.id}.label`)}
          description={tMethods(`${method.id}.description`)}
          disabled={!method.available}
          disabledBadge={t("comingSoon")}
        />
      ))}
    </div>
  );
}
