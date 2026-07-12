import { getTranslations } from "next-intl/server";
import { Header, Footer } from "@/components/layout";

/** Public storefront shell — header, footer and skip link. */
export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("header");

  return (
    <>
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:rounded-2xl focus:px-5 focus:py-2.5 focus:text-sm"
      >
        {t("skipToContent")}
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
