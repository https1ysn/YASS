import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductGallery, ProductInfo, ProductRail, StickyAddToCart } from "@/components/product";
import { getProductGallery, getProductSpecifications } from "@/constants/shop";
import { getProducts } from "@/lib/supabase/queries";
import { getLocaleAlternates, localeHref } from "@/i18n/alternates";
import { intlTagByLocale, type AppLocale } from "@/i18n/routing";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/constants/cart";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [products, t] = await Promise.all([getProducts(), getTranslations("metadata")]);
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: t("productFallbackTitle") };
  return {
    title: product.name,
    description: product.description,
    alternates: { languages: getLocaleAlternates(`/products/${slug}`) },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [products, t, tSpecs, locale] = await Promise.all([
    getProducts(),
    getTranslations(),
    getTranslations("specifications"),
    getLocale(),
  ]);
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

  const shippingReturns = t.raw("shippingReturns") as string[];
  const threshold = formatPrice(FREE_SHIPPING_THRESHOLD, "USD", intlTagByLocale[locale as AppLocale]);
  const localizedShippingReturns = shippingReturns.map((line) =>
    line.replace("{threshold}", threshold)
  );
  const careInstructions = t.raw("careInstructions") as string[];

  return (
    <>
      <Container className="pt-6 sm:pt-8">
        <Breadcrumb
          ariaLabel={t("common.breadcrumb")}
          items={[
            { label: t("common.home"), href: localeHref(locale, "/") },
            { label: t("nav.shop"), href: localeHref(locale, "/shop") },
            {
              label: product.category,
              href: localeHref(locale, `/collections/${product.category.toLowerCase()}`),
            },
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
            specifications={getProductSpecifications(product, tSpecs)}
            shipping={localizedShippingReturns}
            care={careInstructions}
          />
        </div>
      </Container>

      <ProductRail
        eyebrow={t("product.rail.completeTheLook")}
        title={t("product.rail.relatedPieces")}
        products={related}
      />
      <ProductRail
        eyebrow={t("product.rail.forYou")}
        title={t("product.rail.youMayAlsoLike")}
        products={alsoLike}
        className="bg-surface/50"
      />
      <ProductRail
        eyebrow={t("product.rail.yourHistory")}
        title={t("product.rail.recentlyViewed")}
        products={recentlyViewed}
      />

      <StickyAddToCart product={product} />
    </>
  );
}
