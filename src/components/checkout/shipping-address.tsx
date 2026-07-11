import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { shippingCountries } from "@/constants/cart";

/** Shipping address fields — uncontrolled, Morocco preselected. */
export function ShippingAddress() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          name="country"
          label="Country"
          defaultValue="Morocco"
          autoComplete="country-name"
          required
        >
          {shippingCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </Select>
        <Input
          name="city"
          label="City"
          placeholder="e.g. Casablanca"
          autoComplete="address-level2"
          required
        />
      </div>
      <Input
        name="street"
        label="Street address"
        placeholder="Street, building, apartment"
        autoComplete="street-address"
        required
      />
      <Input
        name="postalCode"
        label="Postal code"
        placeholder="e.g. 20000"
        autoComplete="postal-code"
        inputMode="numeric"
        hint="Optional."
        className="sm:max-w-56"
      />
    </div>
  );
}
