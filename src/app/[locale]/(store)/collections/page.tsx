import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { CollectionHero, CollectionGrid } from "@/components/shop";
import { getCollections } from "@/lib/supabase/queries";
import { getLocaleAlternates, localeHref } from "@/i18n/alternates";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("collectionsTitle"),
    description: t("collectionsDescription"),
    alternates: { languages: getLocaleAlternates("/collections") },
  };
}

export default async function CollectionsPage() {
  const [collections, t, locale] = await Promise.all([
    getCollections(),
    getTranslations(),
    getLocale(),
  ]);

  return (
    <>
      <CollectionHero
        eyebrow={t("collectionsPage.eyebrow")}
        title={t("collectionsPage.title")}
        description={t("collectionsPage.description")}
        breadcrumb={[
          { label: t("common.home"), href: localeHref(locale, "/") },
          { label: t("nav.collections") },
        ]}
      />
      <Container className="py-10 pb-16 sm:py-14 sm:pb-24">
        <CollectionGrid collections={collections} />
      </Container>
    </>
  );
}
