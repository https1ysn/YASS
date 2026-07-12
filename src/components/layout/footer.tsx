import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import type { SiteSettings } from "@/schemas/admin-settings";
import { NewsletterSection } from "./newsletter-section";
import { Copyright } from "./copyright";

/** Social links from Website Settings, in display order, keeping only those set. */
function socialsFromSettings(social: SiteSettings["social"]) {
  return (
    [
      ["Instagram", social.instagram],
      ["Facebook", social.facebook],
      ["TikTok", social.tiktok],
      ["X", social.x],
      ["YouTube", social.youtube],
      ["LinkedIn", social.linkedin],
    ] as const
  )
    .filter(([, href]) => href.trim())
    .map(([label, href]) => ({ label, href }));
}

export async function Footer({ settings }: { settings?: SiteSettings }) {
  const t = await getTranslations();

  const storeName = settings?.general.storeName || siteConfig.name;
  const logoUrl = settings?.general.logoUrl ?? null;
  const tagline =
    settings?.homepage.footerText?.trim() ||
    settings?.general.tagline?.trim() ||
    t("footer.tagline");

  const configuredSocials = settings ? socialsFromSettings(settings.social) : [];
  const socials = configuredSocials.length > 0 ? configuredSocials : siteConfig.footer.socials;

  return (
    <footer className="border-border bg-surface mt-auto border-t">
      <Container>
        <div className="py-12 sm:py-16">
          <NewsletterSection
            title={settings?.homepage.newsletterTitle?.trim() || undefined}
            description={settings?.homepage.newsletterDescription?.trim() || undefined}
          />
        </div>

        <div className="grid grid-cols-2 gap-10 pb-14 sm:grid-cols-[2fr_1fr] sm:gap-8">
          <div className="col-span-2 flex max-w-sm flex-col gap-4 sm:col-span-1">
            <Link
              href="/"
              aria-label={t("header.homeAria", { name: storeName })}
              className="text-foreground flex w-fit items-center rounded-lg"
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={storeName}
                  width={160}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <span className="text-lg font-bold tracking-[0.35em]">{siteConfig.wordmark}</span>
              )}
            </Link>
            <p className="text-muted text-sm leading-relaxed">{tagline}</p>
            <ul className="mt-2 flex flex-wrap gap-5">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-foreground text-xs tracking-[0.15em] uppercase transition-colors"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {siteConfig.footer.columns.map((column) => (
            <nav key={column.titleKey} aria-label={t(`footer.${column.titleKey}`)}>
              <p className="text-muted mb-4 text-xs font-medium tracking-[0.18em] uppercase">
                {t(`footer.${column.titleKey}`)}
              </p>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground/75 hover:text-foreground text-sm transition-colors"
                    >
                      {t(`footer.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <Copyright />
    </footer>
  );
}
