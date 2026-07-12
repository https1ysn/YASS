import * as React from "react";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { localeHref } from "@/i18n/alternates";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const locale = await getLocale();

  return (
    <section aria-label={t("sectionAriaLabel")} className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <Badge variant="outline" className="animate-slide-up">
              {t("badge")}
            </Badge>
            <h1 className="animate-slide-up [animation-delay:100ms]">{t("title")}</h1>
            <p className="animate-slide-up text-muted text-base leading-relaxed [animation-delay:200ms] sm:text-lg">
              {t("description")}
            </p>
            <div className="animate-slide-up flex flex-col gap-3 self-stretch [animation-delay:300ms] sm:flex-row sm:self-auto">
              <ButtonLink href={localeHref(locale, "/shop")} size="lg">
                {t("shopNewArrivals")}
              </ButtonLink>
              <ButtonLink href={localeHref(locale, "/collections")} variant="outline" size="lg">
                {t("exploreCollections")}
              </ButtonLink>
            </div>
          </div>

          <div className="animate-scale-in relative [animation-delay:150ms]">
            <div className="shadow-lift relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/hero/hero.jpg"
                alt={t("imageAlt")}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="glass shadow-elevated absolute bottom-4 start-4 flex items-center gap-3 rounded-2xl px-5 py-3.5 sm:bottom-6 sm:start-6">
              <span className="bg-secondary size-2 rounded-full" aria-hidden="true" />
              <div className="flex flex-col">
                <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
                  {t("justLanded")}
                </p>
                <p className="text-foreground text-sm font-semibold">{t("autumnCapsule")}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
