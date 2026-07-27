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
          // Three tracks with equal 1fr sides keep the nav optically centered in
          // the viewport regardless of how wide the logo or the action cluster
          // grow — `justify-between` centered it only when both happened to
          // match. The middle track collapses to zero below `lg`, where the
          // desktop nav is hidden.
          "grid grid-cols-[1fr_auto_1fr] items-center gap-4",
          // Tall enough for the doubled mark, with the extra row of space the
          // stacked tagline needs when one is set.
          hasTagline ? "h-32 lg:h-36" : "h-28 lg:h-32"
        )}
      >
        {/* Columns are placed explicitly: below `lg` the nav list is
            `display:none`, which drops it out of grid flow entirely — without
            this the actions would auto-flow into the middle track and float in
            the centre instead of hugging the right edge. */}
        <div className="col-start-1 flex min-w-0 items-center gap-1 sm:gap-3">
          <MobileNav brand={brand} />
          <div className="flex min-w-0 flex-col justify-center gap-1">
            <Link
              href="/"
              aria-label={t("homeAria", { name: brand.name })}
              className="text-navbar-active flex min-w-0 items-center rounded-lg"
            >
              <BrandMark
                name={brand.name}
                logoUrl={brand.logoUrl}
                priority
                className="max-w-[46vw] sm:max-w-none"
                /* `sm:` is set explicitly: BrandMark's default carries an
                   `sm:h-9`, which a plain `h-…` override would leave in place
                   and shrink the logo on tablets. The max-widths are a guard so
                   an unusually wide logo scales down instead of colliding with
                   the action buttons — object-contain keeps the ratio. */
                imageClassName="h-22 max-w-[52vw] sm:h-22 sm:max-w-[40vw] lg:h-26 lg:max-w-none"
              />
            </Link>
            {hasTagline && (
              <p className="text-muted max-w-[46vw] truncate text-[10px] leading-none font-medium tracking-[0.18em] uppercase sm:max-w-xs lg:max-w-sm">
                {brand.tagline}
              </p>
            )}
          </div>
        </div>

        <DesktopNav className="col-start-2 hidden h-full lg:flex" />

        <div className="col-start-3 flex items-center gap-0.5 justify-self-end sm:gap-1">
          <LanguageSwitcher className="hidden sm:block" />
          <ThemeToggle className="hidden lg:inline-flex" />
          <SearchBar />
          <CartButton />
        </div>
      </nav>
    </Container>
  );
}
