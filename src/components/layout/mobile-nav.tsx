"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Drawer } from "@/components/ui/drawer";
import { Link } from "@/i18n/navigation";
import { MenuIcon, iconActionClasses } from "./icons";
import { LanguageSwitcher } from "./language-switcher";

export function MobileNav() {
  const t = useTranslations("header");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("openMenu")}
        className={cn(iconActionClasses, "-ml-2")}
      >
        <MenuIcon />
      </button>

      <Drawer
        open={open}
        onClose={close}
        side="left"
        title={siteConfig.wordmark}
        closeLabel={tCommon("close")}
      >
        <nav aria-label={t("mobileNavigation")} className="flex h-full flex-col">
          <ul className="flex flex-col">
            {siteConfig.nav.map((item) => (
              <li key={item.key} className="border-border border-b">
                <Link
                  href={item.href}
                  onClick={close}
                  className="block py-4 text-base font-medium tracking-wide"
                >
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <LanguageSwitcher />
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
