import * as React from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { FAKE_ORDER_NUMBER } from "@/constants/checkout";
import { localeHref } from "@/i18n/alternates";
import { estimateDeliveryRange } from "@/lib/delivery";
import type { AppLocale } from "@/i18n/routing";

function SuccessIllustration() {
  return (
    <div className="animate-scale-in relative grid place-items-center" aria-hidden="true">
      <span className="bg-secondary/10 absolute size-36 rounded-full sm:size-44" />
      <span className="bg-secondary/15 absolute size-27 rounded-full sm:size-33" />
      <span className="bg-secondary text-secondary-foreground shadow-elevated grid size-18 place-items-center rounded-full sm:size-22">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8 sm:size-9"
        >
          <path d="m5.5 12.5 4.2 4.2 8.8-9.4" />
        </svg>
      </span>
    </div>
  );
}

export interface OrderConfirmationProps {
  /** Real order number from the database; falls back to the demo number. */
  orderNumber?: string;
  estimatedDelivery?: string;
}

/** Post-checkout confirmation. */
export async function OrderConfirmation({
  orderNumber = FAKE_ORDER_NUMBER,
  estimatedDelivery,
}: OrderConfirmationProps) {
  const [t, locale] = await Promise.all([
    getTranslations("checkout.confirmation"),
    getLocale(),
  ]);
  const delivery = estimatedDelivery ?? estimateDeliveryRange("standard", locale as AppLocale);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-20 text-center sm:py-28">
      <SuccessIllustration />

      <div className="animate-slide-up flex flex-col gap-3 pt-6 [animation-delay:150ms]">
        <p className="text-secondary text-xs font-medium tracking-[0.25em] uppercase">
          {t("kicker")}
        </p>
        <h1 className="text-3xl sm:text-4xl">{t("title")}</h1>
        <p className="text-muted text-base leading-relaxed">{t("description")}</p>
      </div>

      <dl className="animate-slide-up grid w-full grid-cols-1 gap-4 [animation-delay:250ms] sm:grid-cols-2">
        <div className="border-border bg-surface shadow-soft flex flex-col gap-1 rounded-2xl border p-5">
          <dt className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
            {t("orderNumber")}
          </dt>
          <dd className="text-lg font-semibold tracking-tight">{orderNumber}</dd>
        </div>
        <div className="border-border bg-surface shadow-soft flex flex-col gap-1 rounded-2xl border p-5">
          <dt className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
            {t("estimatedDelivery")}
          </dt>
          <dd className="text-lg font-semibold tracking-tight">{delivery}</dd>
        </div>
      </dl>

      <div className="animate-slide-up flex w-full flex-col gap-3 [animation-delay:350ms] sm:w-auto sm:flex-row">
        <ButtonLink href={localeHref(locale, "/shop")} size="lg">
          {t("continueShopping")}
        </ButtonLink>
        <ButtonLink href={localeHref(locale, "/")} variant="outline" size="lg">
          {t("backToHome")}
        </ButtonLink>
      </div>
    </div>
  );
}
