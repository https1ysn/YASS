"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/layout/icons";
import { shippingCountries } from "@/constants/cart";

/** Shipping estimate — UI only; always returns the same friendly demo answer. */
export function ShippingEstimate() {
  const [country, setCountry] = React.useState<string>(shippingCountries[0]);
  const [postalCode, setPostalCode] = React.useState("");
  const [estimate, setEstimate] = React.useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setEstimate(
      `${country}${postalCode ? ` · ${postalCode}` : ""} — 2 to 4 working days, complimentary over $150.`
    );
  }

  return (
    <details className="group border-border border-t">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium tracking-wide select-none [&::-webkit-details-marker]:hidden">
        Estimate shipping
        <ChevronDownIcon className="text-muted size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <form onSubmit={submit} className="animate-fade-in flex flex-col gap-3 pb-4">
        <Select
          aria-label="Country"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          className="h-10 rounded-xl text-sm"
        >
          {shippingCountries.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <input
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            placeholder="Postal code"
            aria-label="Postal code"
            className="border-border bg-surface-elevated placeholder:text-muted focus:border-secondary focus:ring-secondary/25 h-10 w-full flex-1 rounded-xl border px-3.5 text-sm transition-all focus:ring-2 focus:outline-none"
          />
          <Button type="submit" variant="outline" size="sm" className="h-10 rounded-xl">
            Estimate
          </Button>
        </div>
        {estimate && (
          <p role="status" className="animate-fade-in text-success text-xs leading-relaxed">
            {estimate}
          </p>
        )}
      </form>
    </details>
  );
}
