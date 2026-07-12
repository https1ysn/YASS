import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CartView } from "@/components/cart";
import { ProductRail } from "@/components/product";
import { getProducts } from "@/lib/supabase/queries";
import { getLocaleAlternates, localeHref } from "@/i18n/alternates";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("cartTitle"),
    description: t("cartDescription"),
    alternates: { languages: getLocaleAlternates("/cart") },
  };
}

export default async function CartPage() {
  // The cart lives on the client, so the rail is a static curated pick.
  const [products, t, locale] = await Promise.all([
    getProducts(),
    getTranslations(),
    getLocale(),
  ]);
  const recommended = products.slice(0, 4);

  return (
    <>
      <Container className="pt-6 sm:pt-8">
        <Breadcrumb
          ariaLabel={t("common.breadcrumb")}
          items={[
            { label: t("common.home"), href: localeHref(locale, "/") },
            { label: t("metadata.cartTitle") },
          ]}
          className="animate-fade-in mb-5 sm:mb-7"
        />
        <h1 className="animate-slide-up text-3xl sm:text-4xl lg:text-5xl">
          {t("metadata.cartTitle")}
        </h1>
      </Container>

      <Container className="py-8 sm:py-12">
        <CartView />
      </Container>

      <ProductRail
        eyebrow={t("cart.curatedForYou")}
        title={t("product.rail.youMayAlsoLike")}
        products={recommended}
        className="bg-surface/50"
      />
    </>
  );
}
