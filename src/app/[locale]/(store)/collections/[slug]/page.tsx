import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { CollectionHero, ProductBrowser } from "@/components/shop";
import {
  getCollectionBySlug,
  getCollections,
  getProductsByCollection,
} from "@/lib/supabase/queries";
import { getLocaleAlternates, localeHref } from "@/i18n/alternates";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [collection, t] = await Promise.all([
    getCollectionBySlug(slug),
    getTranslations("metadata"),
  ]);
  if (!collection) return { title: t("collectionFallbackTitle") };
  return {
    title: collection.name,
    description: collection.description,
    alternates: { languages: getLocaleAlternates(`/collections/${slug}`) },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const [products, t, locale] = await Promise.all([
    getProductsByCollection(slug),
    getTranslations(),
    getLocale(),
  ]);

  return (
    <>
      <CollectionHero
        eyebrow={t("collectionsPage.singleEyebrow")}
        title={collection.name}
        description={collection.description}
        imageSrc={collection.imageSrc}
        imageAlt={collection.name}
        count={products.length}
        breadcrumb={[
          { label: t("common.home"), href: localeHref(locale, "/") },
          { label: t("nav.collections"), href: localeHref(locale, "/collections") },
          { label: collection.name },
        ]}
      />
      <ProductBrowser products={products} />
    </>
  );
}
