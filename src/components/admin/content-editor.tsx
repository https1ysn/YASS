"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type { FlatMessages } from "@/lib/content";
import { saveContent } from "@/app/admin/(panel)/content/actions";

export interface ContentEditorLocale {
  locale: string;
  defaults: FlatMessages;
  overrides: FlatMessages;
}

export interface ContentEditorProps {
  locales: ContentEditorLocale[];
}

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

/** Anything longer than this reads better in a textarea than a single line. */
const MULTILINE_THRESHOLD = 80;

/** Turns "home.featuredCategories.title" into a readable field label. */
function humanize(key: string): string {
  const last = key.split(".").pop() ?? key;
  if (/^\d+$/.test(last)) {
    const parent = key.split(".").slice(-2, -1)[0] ?? "";
    return `${humanize(parent)} — item ${Number(last) + 1}`;
  }
  return last
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * The Content dashboard — every user-facing string on the storefront, per
 * language.
 *
 * The shipped messages/*.json stay the source of truth for which keys exist and
 * what they say by default; this only stores overrides. A field left blank
 * therefore means "use the shipped translation", which is what makes Reset
 * instant and keeps a copy refactor from stranding rows in the database.
 */
export function ContentEditor({ locales }: ContentEditorProps) {
  const router = useRouter();
  const [active, setActive] = React.useState(locales[0]?.locale ?? "en");
  const [query, setQuery] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  // One draft per locale so switching tabs never discards pending edits.
  const [drafts, setDrafts] = React.useState<Record<string, FlatMessages>>(() =>
    Object.fromEntries(locales.map((entry) => [entry.locale, { ...entry.overrides }]))
  );

  const current = locales.find((entry) => entry.locale === active) ?? locales[0];
  // Memoized so the `?? {}` fallback doesn't produce a fresh object each render
  // and re-run the grouping/diff memos below on every keystroke.
  const draft = React.useMemo(() => drafts[active] ?? {}, [drafts, active]);

  const changed = React.useMemo(() => {
    const out: FlatMessages = {};
    for (const key of Object.keys(current?.defaults ?? {})) {
      const next = draft[key] ?? "";
      const saved = current?.overrides[key] ?? "";
      if (next !== saved) out[key] = next;
    }
    return out;
  }, [draft, current]);

  const changedCount = Object.keys(changed).length;

  /** Keys grouped by their top-level namespace, filtered by the search box. */
  const groups = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const map = new Map<string, string[]>();

    for (const [key, fallback] of Object.entries(current?.defaults ?? {})) {
      if (needle) {
        const value = (draft[key] || fallback).toLowerCase();
        if (!key.toLowerCase().includes(needle) && !value.includes(needle)) continue;
      }
      const namespace = key.split(".")[0];
      const list = map.get(namespace) ?? [];
      list.push(key);
      map.set(namespace, list);
    }
    return [...map.entries()];
  }, [current, draft, query]);

  function update(key: string, value: string) {
    setDrafts((prev) => ({ ...prev, [active]: { ...prev[active], [key]: value } }));
  }

  function resetKey(key: string) {
    update(key, "");
  }

  function discard() {
    setDrafts(Object.fromEntries(locales.map((entry) => [entry.locale, { ...entry.overrides }])));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || changedCount === 0) return;

    setSaving(true);
    const result = await saveContent(active, changed);
    setSaving(false);

    if (!result.ok) {
      toast({ title: "Couldn't save content", description: result.error, variant: "danger" });
      return;
    }
    toast({
      title: "Content saved",
      description: `${result.saved} updated${result.cleared > 0 ? `, ${result.cleared} reset to default` : ""}.`,
      variant: "success",
    });
    router.refresh();
  }

  const searching = query.trim().length > 0;

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 sm:gap-6">
      <Card className="animate-fade-in flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">Storefront copy</h2>
          <p className="text-muted text-sm leading-relaxed">
            Every field falls back to the built-in translation shown as its placeholder. Clear a
            field to go back to that default.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Language"
          className="border-border bg-surface-elevated flex w-fit flex-wrap gap-1 rounded-xl border p-1"
        >
          {locales.map((entry) => {
            const pending = Object.keys(drafts[entry.locale] ?? {}).filter(
              (key) => (drafts[entry.locale]?.[key] ?? "") !== (entry.overrides[key] ?? "")
            ).length;
            const count = Object.values(drafts[entry.locale] ?? {}).filter((v) => v.trim()).length;
            return (
              <button
                key={entry.locale}
                type="button"
                role="tab"
                aria-selected={active === entry.locale}
                onClick={() => setActive(entry.locale)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                  active === entry.locale
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                {LOCALE_LABELS[entry.locale] ?? entry.locale}
                {count > 0 && <span className="ml-1.5 text-[10px] opacity-70">{count}</span>}
                {pending > 0 && <span className="text-warning ml-1">•</span>}
              </button>
            );
          })}
        </div>

        <Input
          label="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by key or text — e.g. “checkout” or “Add to bag”"
          hint={searching ? `${groups.reduce((n, [, keys]) => n + keys.length, 0)} matching` : undefined}
        />
      </Card>

      {groups.length === 0 ? (
        <Card className="animate-fade-in p-6 sm:p-8">
          <p className="text-muted text-sm">No strings match “{query}”.</p>
        </Card>
      ) : (
        groups.map(([namespace, keys]) => {
          const expanded = searching || open[namespace];
          const customized = keys.filter((key) => (draft[key] ?? "").trim()).length;

          return (
            <Card key={namespace} className="animate-fade-in flex flex-col gap-4 p-6 sm:p-8">
              <button
                type="button"
                onClick={() => setOpen((prev) => ({ ...prev, [namespace]: !prev[namespace] }))}
                aria-expanded={Boolean(expanded)}
                className="flex items-center justify-between gap-3 text-left"
              >
                <span className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold tracking-tight sm:text-base">
                    {humanize(namespace)}
                  </h3>
                  <span className="text-muted text-xs">{keys.length}</span>
                  {customized > 0 && (
                    <Badge variant="success" className="px-2 py-0.5 text-[10px]">
                      {customized} edited
                    </Badge>
                  )}
                </span>
                <span className="text-muted text-xs">{expanded ? "Hide" : "Show"}</span>
              </button>

              {expanded && (
                <div className="flex flex-col gap-5">
                  {keys.map((key) => {
                    const fallback = current?.defaults[key] ?? "";
                    const value = draft[key] ?? "";
                    const multiline = fallback.length > MULTILINE_THRESHOLD;
                    const field = multiline ? Textarea : Input;

                    return (
                      <div key={key} className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-foreground text-sm font-medium">
                            {humanize(key)}
                          </span>
                          {value.trim() && (
                            <button
                              type="button"
                              onClick={() => resetKey(key)}
                              className="text-muted hover:text-foreground focus-visible:ring-ring text-xs underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        {React.createElement(field as React.ElementType, {
                          value,
                          rows: multiline ? 2 : undefined,
                          onChange: (
                            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                          ) => update(key, event.target.value),
                          placeholder: fallback,
                          "aria-label": key,
                          dir: active === "ar" ? "rtl" : undefined,
                        })}
                        <p className="text-muted font-mono text-[10px] break-all">{key}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })
      )}

      <div className="glass sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl p-3.5 sm:bottom-6">
        <p className="text-muted mr-auto pl-1 text-xs sm:text-sm">
          {changedCount > 0
            ? `${changedCount} unsaved change${changedCount === 1 ? "" : "s"} in ${LOCALE_LABELS[active] ?? active}.`
            : "Saved copy goes live on the storefront immediately."}
        </p>
        <Button type="button" variant="ghost" onClick={discard} disabled={saving || changedCount === 0}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saving} disabled={changedCount === 0}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
