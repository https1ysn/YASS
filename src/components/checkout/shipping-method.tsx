"use client";

import * as React from "react";
import { formatPrice } from "@/lib/utils";
import { shippingMethods } from "@/constants/checkout";
import { OptionCard } from "./option-card";

export interface ShippingMethodProps {
  value: string;
  onChange: (value: string) => void;
}

export function ShippingMethod({ value, onChange }: ShippingMethodProps) {
  return (
    <div role="radiogroup" aria-label="Shipping method" className="flex flex-col gap-3">
      {shippingMethods.map((method) => (
        <OptionCard
          key={method.id}
          name="shippingMethod"
          value={method.id}
          checked={value === method.id}
          onChange={onChange}
          label={method.label}
          description={method.description}
          meta={method.price === 0 ? "Complimentary" : formatPrice(method.price)}
        />
      ))}
    </div>
  );
}
