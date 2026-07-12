"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

const navLinkClasses = cn(
  "inline-flex h-full items-center px-4 text-sm font-medium tracking-wide text-foreground/75 transition-colors",
  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
);

export function DesktopNav({ className }: { className?: string }) {
  const t = useTranslations("nav");

  return (
    <ul className={cn("items-stretch", className)}>
      {siteConfig.nav.map((item) => (
        <li key={item.key} className="flex items-stretch">
          <Link href={item.href} className={navLinkClasses}>
            {t(item.key)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
