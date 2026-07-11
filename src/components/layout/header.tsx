"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AnnouncementBar } from "./announcement-bar";
import { Navbar } from "./navbar";

/**
 * Site header: the announcement bar scrolls away, the navbar stays sticky and
 * turns glassy once the page is scrolled.
 */
export function Header() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "border-border sticky top-0 z-40 border-b transition-all",
          scrolled ? "bg-background/75 shadow-soft backdrop-blur-xl" : "bg-background"
        )}
      >
        <div className="relative">
          <Navbar />
        </div>
      </header>
    </>
  );
}
