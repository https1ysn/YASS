"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";

export function Navbar() {
  return (
    <Container>
      <nav
        aria-label="Main navigation"
        className="flex h-16 items-center justify-between gap-4 lg:h-20"
      >
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <MobileNav />
          <Link
            href="/"
            aria-label={`${siteConfig.name} — home`}
            className="text-foreground rounded-lg text-lg font-bold tracking-[0.35em] sm:text-xl"
          >
            {siteConfig.wordmark}
          </Link>
        </div>

        <DesktopNav className="hidden h-full lg:flex" />

        <div className="flex items-center gap-0.5 sm:gap-1">
          <SearchBar />
          <CartButton />
        </div>
      </nav>
    </Container>
  );
}
