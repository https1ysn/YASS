import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CartView } from "@/components/cart";
import { ProductRail } from "@/components/product";
import { getProducts } from "@/lib/supabase/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shopping Bag",
  description: "Review the pieces in your bag.",
};

export default async function CartPage() {
  // The cart lives on the client, so the rail is a static curated pick.
  const products = await getProducts();
  const recommended = products.slice(0, 4);

  return (
    <>
      <Container className="pt-6 sm:pt-8">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Shopping Bag" }]}
          className="animate-fade-in mb-5 sm:mb-7"
        />
        <h1 className="animate-slide-up text-3xl sm:text-4xl lg:text-5xl">Shopping Bag</h1>
      </Container>

      <Container className="py-8 sm:py-12">
        <CartView />
      </Container>

      <ProductRail
        eyebrow="Curated for you"
        title="You may also like"
        products={recommended}
        className="bg-surface/50"
      />
    </>
  );
}
