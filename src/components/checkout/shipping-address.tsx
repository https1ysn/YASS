"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { shippingCountries } from "@/constants/cart";

/** Shipping address fields — uncontrolled, Morocco preselected. Values
 * submitted stay canonical English names (matching the admin/orders side);
 * only the visible labels are translated. */
export function ShippingAddress() {
  const t = useTranslations("checkout.shippingAddress");
  const tCountries = useTranslations("countries");

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          name="country"
          label={t("country")}
          defaultValue="Morocco"
          autoComplete="country-name"
          required
        >
          {shippingCountries.map((country) => (
            <option key={country.key} value={country.name}>
              {tCountries(country.key)}
            </option>
          ))}
        </Select>
        <Input
          name="city"
          label={t("city")}
          placeholder={t("cityPlaceholder")}
          autoComplete="address-level2"
          required
        />
      </div>
      <Input
        name="street"
        label={t("street")}
        placeholder={t("streetPlaceholder")}
        autoComplete="street-address"
        required
      />
      <Input
        name="postalCode"
        label={t("postalCode")}
        placeholder={t("postalCodePlaceholder")}
        autoComplete="postal-code"
        inputMode="numeric"
        hint={t("optional")}
        className="sm:max-w-56"
      />
    </div>
  );
}
