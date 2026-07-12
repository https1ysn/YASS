"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/utils";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/cart";

export function AnnouncementBar() {
  const [visible, setVisible] = React.useState(true);
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  if (!visible) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <Container>
        <div className="relative flex h-9 items-center justify-center">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase">
            {t("announcement", {
              threshold: formatPrice(FREE_SHIPPING_THRESHOLD, "USD", intlTagByLocale[locale]),
            })}
          </p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label={t("header.dismissAnnouncement")}
            className="absolute end-0 rounded-full p-1.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-3.5">
              <path
                d="M5 5 15 15M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </Container>
    </div>
  );
}
