"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { UserIcon, iconActionClasses } from "./icons";

const [signIn, createAccount, ...accountLinks] = siteConfig.accountLinks;

export function AccountMenu({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account"
        aria-expanded={open}
        aria-haspopup="menu"
        className={iconActionClasses}
      >
        <UserIcon />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          onClick={() => setOpen(false)}
          className="animate-scale-in border-border bg-surface-elevated shadow-elevated absolute top-full right-0 mt-2 w-60 rounded-2xl border p-2"
        >
          <div className="border-border flex flex-col gap-1 border-b p-2 pb-3">
            <Link
              role="menuitem"
              href={signIn.href}
              className="bg-primary text-primary-foreground hover:bg-primary/85 rounded-xl px-4 py-2.5 text-center text-sm font-medium transition-colors"
            >
              {signIn.label}
            </Link>
            <Link
              role="menuitem"
              href={createAccount.href}
              className="text-muted hover:text-foreground rounded-xl px-4 py-2 text-center text-sm transition-colors"
            >
              {createAccount.label}
            </Link>
          </div>
          <div className="flex flex-col p-1 pt-2">
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                role="menuitem"
                href={link.href}
                className="text-foreground/80 hover:bg-foreground/5 hover:text-foreground rounded-xl px-3 py-2.5 text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
