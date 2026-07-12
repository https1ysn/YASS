import * as React from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { localeHref } from "@/i18n/alternates";

/** Private styling appointment CTA — a calm, service-led invitation. */
export async function CallToAction() {
  const t = await getTranslations("home.cta");
  const locale = await getLocale();

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="border-border bg-surface shadow-elevated grid overflow-hidden rounded-2xl border lg:grid-cols-2">
            <div className="flex flex-col items-start gap-5 p-8 sm:p-12 lg:p-16">
              <p className="text-secondary text-xs font-medium tracking-[0.2em] uppercase">
                {t("eyebrow")}
              </p>
              <h2 className="text-2xl sm:text-3xl">{t("title")}</h2>
              <p className="text-muted text-base leading-relaxed">{t("description")}</p>
              <ButtonLink
                href={localeHref(locale, "/shop")}
                variant="secondary"
                size="lg"
                className="mt-2"
              >
                {t("bookAppointment")}
              </ButtonLink>
            </div>
            <div className="from-secondary/90 to-secondary/60 relative hidden bg-gradient-to-br lg:block">
              <div className="absolute inset-0 grid place-items-center p-16">
                <p className="text-secondary-foreground/95 max-w-xs text-center text-xl leading-relaxed font-medium italic">
                  “{t("quote")}”
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
