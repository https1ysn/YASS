import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const navLinkClasses = cn(
  "inline-flex h-full items-center px-4 text-sm font-medium tracking-wide text-foreground/75 transition-colors",
  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
);

export function DesktopNav({ className }: { className?: string }) {
  return (
    <ul className={cn("items-stretch", className)}>
      {siteConfig.nav.map((item) => (
        <li key={item.label} className="flex items-stretch">
          <Link href={item.href} className={navLinkClasses}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
