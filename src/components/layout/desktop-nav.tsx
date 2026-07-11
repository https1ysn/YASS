"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ChevronDownIcon } from "./icons";
import { MegaMenu } from "./mega-menu";

const navLinkClasses = cn(
  "inline-flex h-full items-center gap-1.5 px-4 text-sm font-medium tracking-wide text-foreground/75 transition-colors",
  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
);

export function DesktopNav({ className }: { className?: string }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = React.useCallback((index: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenIndex(index);
  }, []);

  const scheduleClose = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenIndex(null), 120);
  }, []);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenIndex(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <ul
      className={cn("items-stretch", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpenIndex(null);
      }}
    >
      {siteConfig.nav.map((item, index) => (
        <li
          key={item.label}
          className="flex items-stretch"
          onMouseEnter={item.megaMenu ? () => open(index) : undefined}
          onMouseLeave={item.megaMenu ? scheduleClose : undefined}
        >
          {item.megaMenu ? (
            <>
              <button
                type="button"
                aria-expanded={openIndex === index}
                aria-haspopup="true"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={navLinkClasses}
              >
                {item.label}
                <ChevronDownIcon
                  className={cn(
                    "size-3.5 transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <MegaMenu menu={item.megaMenu} onClose={() => setOpenIndex(null)} />
              )}
            </>
          ) : (
            <Link href={item.href} className={navLinkClasses}>
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
