import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CollectionHero, CollectionGrid } from "@/components/shop";
import { getCollections } from "@/lib/supabase/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore the maison's collections — women, men, accessories and fragrance.",
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <>
      <CollectionHero
        eyebrow="The maison"
        title="Collections"
        description="Six worlds, one language — warm neutrals, honest materials and cuts that outlast seasons."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Collections" }]}
      />
      <Container className="py-10 pb-16 sm:py-14 sm:pb-24">
        <CollectionGrid collections={collections} />
      </Container>
    </>
  );
}
