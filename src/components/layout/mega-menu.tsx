"use client";

import * as React from "react";
import Link from "next/link";
import type { NavItem } from "@/config/site";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "./icons";

interface MegaMenuProps {
  menu: NonNullable<NavItem["megaMenu"]>;
  onClose: () => void;
}

/**
 * Full-width panel anchored to the sticky header. Any link click bubbles up
 * and closes the menu.
 */
export function MegaMenu({ menu, onClose }: MegaMenuProps) {
  return (
    <div
      onClick={onClose}
      className="animate-fade-in border-border bg-surface-elevated shadow-elevated absolute inset-x-0 top-full border-b"
    >
      <Container>
        <div className="grid grid-cols-4 gap-10 py-10">
          {menu.columns.map((column) => (
            <div key={column.title}>
              <p className="text-muted mb-4 text-xs font-medium tracking-[0.18em] uppercase">
                {column.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground/75 hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Link
            href={menu.featured.href}
            className="group hover-lift from-secondary to-secondary/75 text-secondary-foreground flex flex-col justify-between gap-8 rounded-2xl bg-gradient-to-br p-6"
          >
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase opacity-80">
                {menu.featured.eyebrow}
              </p>
              <p className="text-xl font-semibold tracking-tight">{menu.featured.title}</p>
              <p className="text-sm leading-relaxed opacity-90">{menu.featured.description}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              {menu.featured.cta}
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
