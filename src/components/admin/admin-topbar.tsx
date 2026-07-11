"use client";

import * as React from "react";
import Link from "next/link";
import { Drawer } from "@/components/ui/drawer";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { MenuIcon, iconActionClasses } from "@/components/layout/icons";
import { AdminSidebarContent } from "./admin-sidebar";

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/products/new")) return "New product";
  if (pathname.startsWith("/admin/products") && pathname.endsWith("/edit")) return "Edit product";
  if (pathname.startsWith("/admin/products")) return "Products";
  return "Dashboard";
}

/** Sticky top bar — mobile menu drawer trigger, page context, store link. */
export function AdminTopbar() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="border-border bg-background/75 sticky top-0 z-20 border-b backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            className={`${iconActionClasses} -ml-2 lg:hidden`}
          >
            <MenuIcon />
          </button>
          <p className="truncate text-sm font-semibold tracking-tight sm:text-base">
            {pageTitle(pathname)}
          </p>
        </div>

        <Link
          href="/"
          className="text-muted hover:text-foreground text-xs font-medium tracking-[0.15em] uppercase transition-colors"
        >
          View store
        </Link>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} side="left" title={siteConfig.wordmark}>
        <AdminSidebarContent onNavigate={() => setOpen(false)} />
      </Drawer>
    </header>
  );
}
