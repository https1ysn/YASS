"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, iconActionClasses } from "./icons";

export function SearchBar() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    setQuery("");
    // No dedicated search-results page yet — send shoppers to the full catalog.
    router.push("/shop");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={iconActionClasses}
      >
        <SearchIcon />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Search" size="lg">
        <form onSubmit={submit} role="search" className="flex flex-col gap-6">
          <div className="relative">
            <SearchIcon className="text-muted pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for products, collections…"
              aria-label="Search query"
              className="border-border bg-surface-elevated text-foreground shadow-soft placeholder:text-muted focus:border-secondary focus:ring-secondary/25 h-13 w-full rounded-2xl border pr-4 pl-11 text-base transition-all focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-muted text-xs font-medium tracking-[0.18em] uppercase">
              Popular searches
            </p>
            <div className="flex flex-wrap gap-2">
              {siteConfig.popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full transition-transform focus-visible:outline-none active:scale-[0.97]"
                >
                  <Badge
                    variant="outline"
                    className="hover:bg-foreground/5 cursor-pointer normal-case transition-colors"
                  >
                    {term}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
