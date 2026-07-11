"use client";

import * as React from "react";
import { paymentMethods } from "@/constants/checkout";
import { OptionCard } from "./option-card";

export interface PaymentMethodProps {
  value: string;
  onChange: (value: string) => void;
}

export function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="flex flex-col gap-3">
      {paymentMethods.map((method) => (
        <OptionCard
          key={method.id}
          name="paymentMethod"
          value={method.id}
          checked={value === method.id}
          onChange={onChange}
          label={method.label}
          description={method.description}
          disabled={!method.available}
          disabledBadge="Coming soon"
        />
      ))}
    </div>
  );
}
