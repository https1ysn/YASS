import * as React from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { localeHref } from "@/i18n/alternates";
import { getSiteSettings } from "@/lib/settings";

/** Full-width closing statement before the footer. */
export async function FinalCtaBanner() {
  const t = await getTranslations("home.finalCta");
  const locale = await getLocale();
  const { branding } = await getSiteSettings();

  return (
    <section className="bg-primary text-primary-foreground py-20 sm:py-28">
      <Container size="md">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <p className="text-xs font-medium tracking-[0.25em] uppercase opacity-70">
            {t("kicker", { name: branding.websiteName })}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            {t("title")}
          </h2>
          <p className="max-w-xl text-base leading-relaxed opacity-80">{t("description")}</p>
          <div className="mt-2 flex flex-col gap-3 self-stretch sm:flex-row sm:justify-center sm:self-auto">
            <ButtonLink href={localeHref(locale, "/shop")} variant="secondary" size="lg">
              {t("shopNewSeason")}
            </ButtonLink>
            <ButtonLink
              href={localeHref(locale, "/collections")}
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary border bg-transparent shadow-none"
            >
              {t("browseCollections")}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
