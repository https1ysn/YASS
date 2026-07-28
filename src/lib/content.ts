import { cache } from "react";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./supabase/config";
import { createClient } from "@supabase/supabase-js";

/**
 * Storefront copy overrides.
 *
 * Every user-facing string ships in messages/{locale}.json and is read through
 * next-intl. This module lets the admin override any of those keys per locale
 * from the database, merged on top of the shipped catalog at request time — so
 * the files stay the source of truth for which keys exist and what they say by
 * default, while the admin owns the wording.
 */

/** A message value that can be edited: a leaf string, wherever it sits. */
export type FlatMessages = Record<string, string>;

type MessageNode = string | number | boolean | null | MessageNode[] | { [key: string]: MessageNode };

/**
 * Flattens a message catalog to dot paths. Array entries take a numeric
 * segment ("shippingReturns.0"), which `applyContentOverrides` understands, so
 * list copy is editable item by item.
 */
export function flattenMessages(node: MessageNode, prefix = "", out: FlatMessages = {}): FlatMessages {
  if (typeof node === "string") {
    if (prefix) out[prefix] = node;
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) => flattenMessages(item, prefix ? `${prefix}.${index}` : String(index), out));
    return out;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      flattenMessages(value, prefix ? `${prefix}.${key}` : key, out);
    }
  }
  return out;
}

/**
 * Writes `value` at a dot path, following the shape already present in the
 * target. Only paths that resolve to an existing string are written: an
 * override left behind by a renamed key is ignored rather than growing a stray
 * branch that no component reads.
 */
function setByPath(target: Record<string, unknown>, path: string, value: string): boolean {
  const segments = path.split(".");
  let cursor: unknown = target;

  for (let i = 0; i < segments.length - 1; i += 1) {
    if (!cursor || typeof cursor !== "object") return false;
    cursor = (cursor as Record<string, unknown>)[segments[i]];
  }

  const last = segments[segments.length - 1];
  if (!cursor || typeof cursor !== "object") return false;

  const container = cursor as Record<string, unknown>;
  if (typeof container[last] !== "string") return false;

  container[last] = value;
  return true;
}

/**
 * Returns a copy of `messages` with the overrides applied. The input is never
 * mutated — next-intl may hand back a module-level object that is reused across
 * requests, and writing into it would leak one shop's copy into the next
 * request.
 */
export function applyContentOverrides(
  messages: Record<string, unknown>,
  overrides: FlatMessages
): Record<string, unknown> {
  const entries = Object.entries(overrides);
  if (entries.length === 0) return messages;

  const merged = structuredClone(messages);
  for (const [key, value] of entries) setByPath(merged, key, value);
  return merged;
}

/** Anonymous client — overrides are public content, read on every render. */
const anonClient =
  isSupabaseConfigured && supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

/**
 * The admin's overrides for one locale. Wrapped in React `cache()` so a request
 * hits the database once. Any failure degrades to "no overrides", which renders
 * the shipped translations rather than breaking the page.
 */
export const getContentOverrides = cache(async (locale: string): Promise<FlatMessages> => {
  if (!anonClient) return {};

  try {
    const { data, error } = await anonClient
      .from("content_overrides")
      .select("key, value")
      .eq("locale", locale);

    if (error || !data) return {};

    const out: FlatMessages = {};
    for (const row of data as { key: string; value: string }[]) out[row.key] = row.value;
    return out;
  } catch {
    return {};
  }
});
