import {
  Benefits,
  BestSellers,
  CallToAction,
  FeaturedCategories,
  FeaturedProducts,
  FinalCtaBanner,
} from "@/components/home";
import { getBestSellers, getFeaturedCategories, getFeaturedProducts } from "@/lib/supabase/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, featured, bestSellers] = await Promise.all([
    getFeaturedCategories(),
    getFeaturedProducts(),
    getBestSellers(),
  ]);

  return (
    <>
      <FeaturedCategories categories={categories} />
      <FeaturedProducts products={featured} />
      <Benefits />
      <BestSellers products={bestSellers} />
      <CallToAction />
      <FinalCtaBanner />
    </>
  );
}
