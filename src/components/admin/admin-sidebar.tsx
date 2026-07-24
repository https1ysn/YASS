import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandMark, type BrandIdentity } from "@/components/layout";
import { ArrowRightIcon } from "@/components/layout/icons";
import { AdminNav } from "./admin-nav";
import { LogoutButton } from "./logout-button";

/** Sidebar body — brand mark, nav and the back-to-store link. */
export function AdminSidebarContent({
  brand,
  onNavigate,
}: {
  brand: BrandIdentity;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-8">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="text-foreground flex min-w-0 items-baseline gap-2"
      >
        <BrandMark {...brand} className="text-lg sm:text-lg" imageClassName="h-8 sm:h-8" />
        <span className="text-secondary shrink-0 text-[10px] font-medium tracking-[0.2em] uppercase">
          Admin
        </span>
      </Link>

      <AdminNav onNavigate={onNavigate} />

      <div className="border-border flex flex-col gap-4 border-t pt-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="group text-muted hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowRightIcon className="size-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          Back to store
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}

/** Fixed desktop sidebar (hidden below lg — the topbar drawer takes over). */
export function AdminSidebar({
  brand,
  className,
}: {
  brand: BrandIdentity;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "border-border bg-surface fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r p-6 lg:flex",
        className
      )}
    >
      <AdminSidebarContent brand={brand} />
    </aside>
  );
}
