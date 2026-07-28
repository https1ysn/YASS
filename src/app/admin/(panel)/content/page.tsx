import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { ContentEditor } from "@/components/admin";
import { flattenMessages, getContentOverrides, type FlatMessages } from "@/lib/content";
import { routing, type AppLocale } from "@/i18n/routing";

export const metadata: Metadata = { title: "Content" };

// Always edit against the live overrides.
export const dynamic = "force-dynamic";

export interface LocaleContent {
  locale: AppLocale;
  /** The shipped translation for every key — the fallback shown as a placeholder. */
  defaults: FlatMessages;
  /** Only the keys the admin has overridden. */
  overrides: FlatMessages;
}

async function loadLocale(locale: AppLocale): Promise<LocaleContent> {
  const messages = (await import(`../../../../../messages/${locale}.json`)).default;
  return {
    locale,
    defaults: flattenMessages(messages),
    overrides: await getContentOverrides(locale),
  };
}

export default async function AdminContentPage() {
  const locales = await Promise.all(routing.locales.map((locale) => loadLocale(locale)));
  const keyCount = Object.keys(locales[0]?.defaults ?? {}).length;
  const overridden = locales.reduce(
    (total, entry) => total + Object.keys(entry.overrides).length,
    0
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Content</h1>
        <p className="text-muted text-sm">
          {keyCount} editable {keyCount === 1 ? "string" : "strings"} per language
          {overridden > 0 ? ` · ${overridden} customized` : ""}.
        </p>
      </div>

      {keyCount === 0 ? (
        <Alert variant="danger" title="Couldn't load the message catalog">
          No translatable strings were found in messages/.
        </Alert>
      ) : (
        <ContentEditor locales={locales} />
      )}
    </div>
  );
}
