"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { routing, localeNames, localeFlags, type AppLocale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Header language switcher — 🇫🇷 Français / 🇬🇧 English / 🇲🇦 العربية.
 * Navigates to the same page in the chosen locale via next-intl's router,
 * which performs a client-side transition (no full reload) and persists the
 * choice in the NEXT_LOCALE cookie for future visits.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("languageSwitcher");
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectLocale(next: AppLocale) {
    setOpen(false);
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("ariaLabel")}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "text-foreground/75 hover:text-foreground hover:bg-foreground/5 inline-flex h-11 items-center gap-1.5 rounded-2xl px-3 text-sm font-medium transition-colors",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
        )}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {localeFlags[locale]}
        </span>
        <span className="hidden uppercase sm:inline">{locale}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("label")}
          className="animate-scale-in border-border bg-surface-elevated shadow-elevated absolute top-full end-0 z-20 mt-1.5 w-44 rounded-2xl border p-1.5"
        >
          {routing.locales.map((option) => {
            const active = option === locale;
            return (
              <button
                key={option}
                type="button"
                role="menuitem"
                aria-current={active ? "true" : undefined}
                onClick={() => selectLocale(option)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {localeFlags[option]}
                </span>
                {localeNames[option]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
