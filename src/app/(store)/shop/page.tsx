import type { Metadata } from "next";
import { CollectionHero, ProductBrowser } from "@/components/shop";
import { getProducts } from "@/lib/supabase/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop the full Yasso catalog — considered pieces in warm neutral tones.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <CollectionHero
        eyebrow="Yasso"
        title="Shop all"
        description="The full catalog — every piece, every world, in one considered edit."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />
      <ProductBrowser products={products} />
    </>
  );
}
