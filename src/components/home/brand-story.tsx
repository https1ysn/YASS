import * as React from "react";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { brandStats } from "@/constants/home";
import { localeHref } from "@/i18n/alternates";

export async function BrandStory() {
  const t = await getTranslations("home.brandStory");
  const tRoot = await getTranslations();
  const locale = await getLocale();
  const statLabels = tRoot.raw("home_brandStats") as { label: string }[];

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="shadow-elevated relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src="/images/story/atelier.jpg"
                alt={t("imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={120} className="flex flex-col items-start gap-6">
            <p className="text-secondary text-xs font-medium tracking-[0.2em] uppercase">
              {t("eyebrow")}
            </p>
            <h2>{t("title")}</h2>
            <p className="text-muted text-base leading-relaxed">{t("description")}</p>
            <dl className="border-border grid w-full grid-cols-3 gap-6 border-y py-6">
              {brandStats.map((stat, index) => (
                <div key={stat.value} className="flex flex-col gap-1">
                  <dt className="text-muted order-2 text-xs leading-snug">
                    {statLabels[index]?.label}
                  </dt>
                  <dd className="order-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
            <ButtonLink href={localeHref(locale, "/collections")} variant="outline">
              {t("discoverStory")}
            </ButtonLink>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
