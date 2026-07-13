"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const t = useTranslations("header");

  return (
    <Container>
      <nav
        aria-label={t("mainNavigation")}
        className="flex h-16 items-center justify-between gap-4 lg:h-20"
      >
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <MobileNav />
          <Link
            href="/"
            aria-label={t("homeAria", { name: siteConfig.name })}
            className="text-foreground rounded-lg text-lg font-bold tracking-[0.35em] sm:text-xl"
          >
            {siteConfig.wordmark}
          </Link>
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
