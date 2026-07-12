"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  /** Sections whose CRUD ships in a later phase render disabled. */
  comingSoon?: boolean;
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4.5 shrink-0"
    >
      {children}
    </svg>
  );
}

const items: AdminNavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: (
      <NavIcon>
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </NavIcon>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <NavIcon>
        <path d="M5.3 7h9.4l-.66 8.13a1.75 1.75 0 0 1-1.74 1.62H7.7a1.75 1.75 0 0 1-1.74-1.62L5.3 7Z" />
        <path d="M7.5 7V5.75a2.5 2.5 0 0 1 5 0V7" />
      </NavIcon>
    ),
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: (
      <NavIcon>
        <path d="M3.5 8.5v-4a1 1 0 0 1 1-1h4l8 8-5 5-8-8Z" />
        <circle cx="7" cy="7" r="1" />
      </NavIcon>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <NavIcon>
        <path d="M5 3.5h10v13l-2.5-1.5L10 16.5l-2.5-1.5L5 16.5v-13Z" />
        <path d="M7.5 7.5h5M7.5 10.5h5" />
      </NavIcon>
    ),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: (
      <NavIcon>
        <circle cx="7.5" cy="7" r="2.5" />
        <path d="M3.5 16a4 4 0 0 1 8 0" />
        <circle cx="13.5" cy="7.5" r="2" />
        <path d="M13 12.2a4 4 0 0 1 3.5 3.8" />
      </NavIcon>
    ),
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: (
      <NavIcon>
        <circle cx="10" cy="10" r="2.5" />
        <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4" />
      </NavIcon>
    ),
  },
];

/** Sidebar / drawer navigation list — shared between desktop and mobile. */
export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        if (item.comingSoon) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              className="text-muted flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium opacity-70"
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <Badge variant="muted" className="px-2 py-0.5 text-[10px]">
                Soon
              </Badge>
            </span>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
