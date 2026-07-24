import { getTranslations } from "next-intl/server";
import { Header, Footer, brandFromSettings } from "@/components/layout";
import { getSiteSettings, brandingCssVars } from "@/lib/settings";

/** Public storefront shell — header, footer and skip link. */
export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("header");
  const settings = await getSiteSettings();

  // Maintenance mode replaces the whole storefront (the admin stays reachable).
  if (settings.advanced.maintenanceMode) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center">
        <span className="bg-secondary/15 text-secondary mb-6 grid size-14 place-items-center rounded-2xl">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7"
          >
            <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
          </svg>
        </span>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {settings.branding.websiteName}
        </h1>
        <p className="text-muted mt-3 max-w-md text-base leading-relaxed">
          {settings.advanced.maintenanceMessage}
        </p>
      </main>
    );
  }

  const branding = brandingCssVars(settings);

  return (
    <>
      {branding && (
        <style dangerouslySetInnerHTML={{ __html: `:root{${branding}}` }} />
      )}
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:rounded-2xl focus:px-5 focus:py-2.5 focus:text-sm"
      >
        {t("skipToContent")}
      </a>
      <Header announcement={settings.announcement} brand={brandFromSettings(settings)} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}
