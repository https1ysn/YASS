import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionHero, ProductBrowser } from "@/components/shop";
import {
  getCollectionBySlug,
  getCollections,
  getProductsByCollection,
} from "@/lib/supabase/queries";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection" };
  return { title: collection.name, description: collection.description };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = await getProductsByCollection(slug);

  return (
    <>
      <CollectionHero
        eyebrow="Collection"
        title={collection.name}
        description={collection.description}
        imageSrc={collection.imageSrc}
        imageAlt={collection.name}
        count={products.length}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Collections", href: "/collections" },
          { label: collection.name },
        ]}
      />
      <ProductBrowser products={products} />
    </>
  );
}
