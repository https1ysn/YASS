"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";

/** Optional notes for the courier or atelier. */
export function OrderNotes() {
  const t = useTranslations("checkout.orderNotes");

  return (
    <Textarea
      name="orderNotes"
      label={t("label")}
      placeholder={t("placeholder")}
      hint={t("hint")}
      rows={4}
    />
  );
}
