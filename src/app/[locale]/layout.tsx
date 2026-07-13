import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "@/components/ui/toast";
import { routing, isRtlLocale } from "@/i18n/routing";
import { getLocaleAlternates } from "@/i18n/alternates";
import { getSiteSettings } from "@/lib/settings";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Arabic UI font — only downloaded by the browser when actually rendered
// (i.e. when dir="rtl" activates the --font-sans override in globals.css).
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const { general, seo } = await getSiteSettings();

  const siteName = general.storeName || t("siteName");
  const templateName = seo.websiteTitle.trim() || siteName;
  const defaultTitle = seo.metaTitle.trim() || t("defaultTitle");
  const description = seo.metaDescription.trim() || t("defaultDescription");

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    title: {
      default: defaultTitle,
      template: `%s — ${templateName}`,
    },
    description,
    alternates: { languages: getLocaleAlternates("") },
    icons: general.faviconUrl ? { icon: general.faviconUrl } : undefined,
    openGraph: {
      title: defaultTitle,
      description,
      siteName,
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this request (next-intl requirement).
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "common" });
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} bg-background text-foreground flex min-h-dvh flex-col font-sans antialiased`}
      >
        {/* Applies the theme before first paint — saved choice, then OS
            preference, then light — so there is no flash of the wrong theme.
            Keep the storage key in sync with THEME_STORAGE_KEY. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("yasso-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var c=document.documentElement.classList;c.remove("light","dark");c.add(d?"dark":"light");}catch(e){document.documentElement.classList.add("light");}})();',
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster dismissLabel={t("dismiss")} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
