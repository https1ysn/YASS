import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { NewsletterSection } from "./newsletter-section";
import { Copyright } from "./copyright";

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-border bg-surface mt-auto border-t">
      <Container>
        <div className="py-12 sm:py-16">
          <NewsletterSection />
        </div>

        <div className="grid grid-cols-2 gap-10 pb-14 sm:grid-cols-[2fr_1fr] sm:gap-8">
          <div className="col-span-2 flex max-w-sm flex-col gap-4 sm:col-span-1">
            <Link
              href="/"
              aria-label={t("header.homeAria", { name: siteConfig.name })}
              className="text-foreground w-fit rounded-lg text-lg font-bold tracking-[0.35em]"
            >
              {siteConfig.wordmark}
            </Link>
            <p className="text-muted text-sm leading-relaxed">{t("footer.tagline")}</p>
            <ul className="mt-2 flex gap-5">
              {siteConfig.footer.socials.map((social) => (
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
