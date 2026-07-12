"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { BagIcon } from "@/components/layout/icons";
import { localeHref } from "@/i18n/alternates";
import type { AppLocale } from "@/i18n/routing";

export function EmptyCart() {
  const t = useTranslations("cart.empty");
  const locale = useLocale() as AppLocale;

  return (
    <EmptyState
      icon={<BagIcon className="size-7" />}
      title={t("title")}
      description={t("description")}
      action={
        <ButtonLink href={localeHref(locale, "/shop")} size="lg">
          {t("continueShopping")}
        </ButtonLink>
      }
    />
  );
}
