"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { iconActionClasses } from "./icons";

/** localStorage key for the saved theme — shared with the inline script in
 * src/app/[locale]/layout.tsx that applies it before first paint. */
export const THEME_STORAGE_KEY = "yasso-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

/** Swap the theme with a brief global color cross-fade (see globals.css). */
function transitionTo(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(theme);
  window.setTimeout(() => root.classList.remove("theme-transition"), 350);
}

/**
 * Sun/moon theme switcher. The current theme lives as a .light/.dark class on
 * <html> (set before paint by the layout's inline script), so the icons swap
 * purely via CSS `dark:` variants — no client state, no hydration mismatch.
 * A saved choice wins over the OS preference; without one, live OS changes
 * keep being followed.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("header");

  // No saved preference → track OS preference changes while the page is open.
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange(event: MediaQueryListEvent) {
      try {
        if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      } catch {
        // Storage unavailable — treat as "no saved preference".
      }
      transitionTo(event.matches ? "dark" : "light");
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    transitionTo(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the choice still applies for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleTheme")}
      className={cn(iconActionClasses, className)}
    >
      <span aria-hidden="true" className="relative grid size-5 place-items-center">
        {/* Sun — shown in light mode */}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ease-luxury absolute size-5 scale-100 rotate-0 opacity-100 transition-all duration-300 dark:scale-50 dark:-rotate-90 dark:opacity-0"
        >
          <circle cx="10" cy="10" r="3.25" />
          <path d="M10 2.75v1.5M10 15.75v1.5M2.75 10h1.5M15.75 10h1.5M4.87 4.87l1.06 1.06M14.07 14.07l1.06 1.06M15.13 4.87l-1.06 1.06M5.93 14.07l-1.06 1.06" />
        </svg>
        {/* Moon — shown in dark mode */}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ease-luxury absolute size-5 scale-50 rotate-90 opacity-0 transition-all duration-300 dark:scale-100 dark:rotate-0 dark:opacity-100"
        >
          <path d="M16.25 12.03A6.75 6.75 0 0 1 7.97 3.75a6.75 6.75 0 1 0 8.28 8.28Z" />
        </svg>
      </span>
    </button>
  );
}
