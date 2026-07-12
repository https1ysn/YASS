import * as React from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/components/ui/product-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { featuredProducts as defaultProducts, type PlaceholderProduct } from "@/constants/home";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";
import { localeHref } from "@/i18n/alternates";
import { translateBadge } from "@/lib/product-badge";

export async function FeaturedProducts({
  products = defaultProducts,
}: {
  products?: readonly PlaceholderProduct[];
}) {
  const t = await getTranslations("home.featuredProducts");
  const tBadges = await getTranslations("badges");
  const locale = (await getLocale()) as AppLocale;

  return (
    <Section
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      className="bg-surface/50"
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((product, index) => (
          <Reveal key={product.href} delay={index * 80}>
            <ProductCard
              {...product}
              href={localeHref(locale, product.href)}
              badge={translateBadge(product.badge, tBadges)}
              saleLabel={tBadges("sale")}
              locale={intlTagByLocale[locale]}
            />
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10 flex justify-center sm:mt-14">
        <ButtonLink href={localeHref(locale, "/shop")} variant="outline">
          {t("viewAll")}
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
