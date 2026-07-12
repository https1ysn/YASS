"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/cart";

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  link: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * The slim promo bar above the header. Driven by Website Settings: when
 * disabled it renders nothing; with custom text it uses the admin's colors and
 * optional link; otherwise it falls back to the built-in translated message so
 * the storefront keeps its default banner out of the box.
 */
export function AnnouncementBar({ settings }: { settings?: AnnouncementSettings }) {
  const [visible, setVisible] = React.useState(true);
  const t = useTranslations();
  const locale = useLocale() as AppLocale;

  if (settings && !settings.enabled) return null;
  if (!visible) return null;

  const custom = settings?.text.trim() ? settings : null;
  const message = custom
    ? custom.text
    : t("announcement", {
        threshold: formatPrice(FREE_SHIPPING_THRESHOLD, "USD", intlTagByLocale[locale]),
      });

  const style = custom
    ? { backgroundColor: custom.backgroundColor, color: custom.textColor }
    : undefined;

  const label = (
    <p className="text-[11px] font-medium tracking-[0.2em] uppercase">{message}</p>
  );

  const link = custom?.link.trim();
  const external = link ? /^(https?:)?\/\//.test(link) : false;

  return (
    <div className="bg-primary text-primary-foreground" style={style}>
      <Container>
        <div className="relative flex h-9 items-center justify-center">
          {link ? (
            external ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                {label}
              </a>
            ) : (
              <Link href={link} className="transition-opacity hover:opacity-80">
                {label}
              </Link>
            )
          ) : (
            label
          )}
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
