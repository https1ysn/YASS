import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { CollectionHero, ProductBrowser } from "@/components/shop";
import { getProducts } from "@/lib/supabase/queries";
import { getLocaleAlternates, localeHref } from "@/i18n/alternates";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("shopTitle"),
    description: t("shopDescription"),
    alternates: { languages: getLocaleAlternates("/shop") },
  };
}

export default async function ShopPage() {
  const [products, t, locale] = await Promise.all([
    getProducts(),
    getTranslations(),
    getLocale(),
  ]);

  return (
    <>
      <CollectionHero
        eyebrow="Yasso"
        title={t("shop.hero.title")}
        description={t("shop.hero.description")}
        breadcrumb={[
          { label: t("common.home"), href: localeHref(locale, "/") },
          { label: t("nav.shop") },
        ]}
      />
      <ProductBrowser products={products} />
    </>
  );
}
