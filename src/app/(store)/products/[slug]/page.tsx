import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductGallery, ProductInfo, ProductRail, StickyAddToCart } from "@/components/product";
import {
  careInstructions,
  getProductGallery,
  getProductSpecifications,
  shippingReturns,
} from "@/constants/shop";
import { getProducts } from "@/lib/supabase/queries";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const others = products.filter((p) => p.slug !== product.slug);
  const related = [
    ...others.filter((p) => p.collections.some((c) => product.collections.includes(c))),
    ...others.filter((p) => !p.collections.some((c) => product.collections.includes(c))),
  ].slice(0, 4);
  const alsoLike = others.filter((p) => !related.includes(p)).slice(0, 4);
  const recentlyViewed = others
    .filter((p) => !related.includes(p) && !alsoLike.includes(p))
    .slice(0, 4);

  return (
    <>
      <Container className="pt-6 sm:pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.category, href: `/collections/${product.category.toLowerCase()}` },
            { label: product.name },
          ]}
          className="animate-fade-in"
        />
      </Container>

      <Container>
        <div className="grid gap-8 py-6 sm:py-8 lg:grid-cols-2 lg:gap-16">
          <ProductGallery
            images={product.galleryImages ?? getProductGallery(product)}
            alt={product.imageAlt ?? product.name}
            badge={product.badge}
            className="lg:sticky lg:top-28 lg:self-start"
          />
          <ProductInfo
            product={product}
            specifications={getProductSpecifications(product)}
            shipping={shippingReturns}
            care={careInstructions}
          />
        </div>
      </Container>

      <ProductRail eyebrow="Complete the look" title="Related pieces" products={related} />
      <ProductRail
        eyebrow="For you"
        title="You may also like"
        products={alsoLike}
        className="bg-surface/50"
      />
      <ProductRail eyebrow="Your history" title="Recently viewed" products={recentlyViewed} />

      <StickyAddToCart product={product} />
    </>
  );
}
