"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Drawer } from "@/components/ui/drawer";
import { ChevronDownIcon, MenuIcon, iconActionClasses } from "./icons";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<number | null>(null);

  const close = () => {
    setOpen(false);
    setExpanded(null);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className={cn(iconActionClasses, "-ml-2")}
      >
        <MenuIcon />
      </button>

      <Drawer open={open} onClose={close} side="left" title={siteConfig.wordmark}>
        <nav aria-label="Mobile navigation" className="flex h-full flex-col">
          <ul className="flex flex-col">
            {siteConfig.nav.map((item, index) => (
              <li key={item.label} className="border-border border-b">
                {item.megaMenu ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={expanded === index}
                      onClick={() => setExpanded(expanded === index ? null : index)}
                      className="flex w-full items-center justify-between py-4 text-base font-medium tracking-wide"
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={cn(
                          "text-muted size-4 transition-transform",
                          expanded === index && "rotate-180"
                        )}
                      />
                    </button>
                    {expanded === index && (
                      <div className="animate-fade-in flex flex-col gap-6 pb-5">
                        {item.megaMenu.columns.map((column) => (
                          <div key={column.title}>
                            <p className="text-muted mb-3 text-xs font-medium tracking-[0.18em] uppercase">
                              {column.title}
                            </p>
                            <ul className="flex flex-col gap-3">
                              {column.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    onClick={close}
                                    className="text-foreground/80 hover:text-foreground text-sm transition-colors"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <Link
                          href={item.href}
                          onClick={close}
                          className="text-secondary text-sm font-medium"
                        >
                          View all {item.label} →
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={close}
                    className="block py-4 text-base font-medium tracking-wide"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3">
            {siteConfig.accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="text-muted hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto flex gap-5 pt-10">
            {siteConfig.footer.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground text-xs tracking-[0.15em] uppercase transition-colors"
              >
                {social.label}
              </a>
            ))}
          </div>
        </nav>
      </Drawer>
    </div>
  );
}
