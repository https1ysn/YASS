"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { BrandMark, type BrandIdentity } from "./brand";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Navbar({ brand }: { brand: BrandIdentity }) {
  const t = useTranslations("header");
  const hasTagline = Boolean(brand.tagline);

  return (
    <Container>
      <nav
        aria-label={t("mainNavigation")}
        className={cn(
          "flex items-center justify-between gap-4",
          // The taller bar only applies when a tagline is actually set, so the
          // stacked mark keeps the same breathing room the logo alone has.
          hasTagline ? "h-20 lg:h-24" : "h-16 lg:h-20"
        )}
      >
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <MobileNav brand={brand} />
          <div className="flex min-w-0 flex-col justify-center gap-1">
            <Link
              href="/"
              aria-label={t("homeAria", { name: brand.name })}
              className="text-foreground flex min-w-0 items-center rounded-lg"
            >
              <BrandMark
                name={brand.name}
                logoUrl={brand.logoUrl}
                priority
                className="max-w-[46vw] sm:max-w-none"
                imageClassName="h-11 lg:h-[52px]"
              />
            </Link>
            {hasTagline && (
              <p className="text-muted max-w-[46vw] truncate text-[10px] leading-none font-medium tracking-[0.18em] uppercase sm:max-w-xs lg:max-w-sm">
                {brand.tagline}
              </p>
            )}
          </div>
        </div>

        <DesktopNav className="hidden h-full lg:flex" />

        <div className="flex items-center gap-0.5 sm:gap-1">
          <LanguageSwitcher className="hidden sm:block" />
          <ThemeToggle className="hidden lg:inline-flex" />
          <SearchBar />
          <CartButton />
        </div>
      </nav>
    </Container>
  );
}
