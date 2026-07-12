"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

/** Contact fields — uncontrolled, validated natively via required/type. */
export function ContactInformation() {
  const t = useTranslations("checkout.contactInfo");

  return (
    <div className="flex flex-col gap-5">
      <Input
        name="fullName"
        label={t("fullName")}
        placeholder={t("fullNamePlaceholder")}
        autoComplete="name"
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          name="phone"
          type="tel"
          label={t("phone")}
          placeholder={t("phonePlaceholder")}
          autoComplete="tel"
          required
        />
        <Input
          name="email"
          type="email"
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          hint={t("emailHint")}
        />
      </div>
    </div>
  );
}
