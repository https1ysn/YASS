/**
 * The theme token catalog — the single source of truth shared by the settings
 * schema, the CSS-variable generator (lib/settings.ts) and the admin theme
 * editor. Adding a token here makes it validated, savable, previewable and
 * applied to the storefront with no other wiring.
 *
 * `fallback` is the built-in light-mode value from globals.css. It is NOT
 * written to the database: an unset token stores "" and keeps the built-in
 * `light-dark()` value, so the storefront's automatic light/dark adaptation
 * survives everywhere the admin hasn't deliberately overridden a color. The
 * fallback only seeds the picker's displayed swatch and the live preview.
 */

export interface ThemeTokenDef {
  /** Key inside `settings.theme`. */
  key: string;
  /** CSS custom property the value is emitted as. */
  cssVar: string;
  label: string;
  /** Built-in light-mode value, shown until the admin overrides the token. */
  fallback: string;
  /**
   * Built-in dark-mode value. Present on core tokens only — component tokens
   * (buttons, navbar, footer, cards, inputs) default to `var(--core-token)` in
   * globals.css and therefore follow whichever side the core resolves to.
   */
  fallbackDark?: string;
  /**
   * Core token this one falls back to in globals.css (e.g. `--card-bg` is
   * `var(--surface)`). Lets the resolver compute a concrete color for a blank
   * component token, which the preview and the contrast checks both need.
   */
  derivesFrom?: string;
  hint?: string;
}

export type ThemeMode = "light" | "dark";

export interface ThemeTokenGroup {
  id: string;
  title: string;
  description: string;
  tokens: readonly ThemeTokenDef[];
}

export const THEME_GROUPS = [
  {
    id: "general",
    title: "General",
    description: "Page surfaces and body text.",
    tokens: [
      { key: "background", cssVar: "--background", label: "Background", fallback: "#f8f7f4", fallbackDark: "#181818" },
      { key: "surface", cssVar: "--surface", label: "Surface", fallback: "#ffffff", fallbackDark: "#222222" },
      {
        key: "surfaceElevated",
        cssVar: "--surface-elevated",
        label: "Elevated surface",
        fallback: "#f3f3f3",
        fallbackDark: "#2d2d2d",
      },
      { key: "foreground", cssVar: "--foreground", label: "Foreground", fallback: "#111111", fallbackDark: "#ffffff" },
      { key: "muted", cssVar: "--muted", label: "Muted text", fallback: "#6b7280", fallbackDark: "#b3b3b3" },
    ],
  },
  {
    id: "brand",
    title: "Brand",
    description: "Primary, secondary and accent, with the text that sits on each.",
    tokens: [
      { key: "primary", cssVar: "--primary", label: "Primary", fallback: "#111111", fallbackDark: "#ffffff" },
      {
        key: "primaryForeground",
        cssVar: "--primary-foreground",
        label: "Primary foreground",
        fallback: "#ffffff",
        fallbackDark: "#111111",
      },
      { key: "secondary", cssVar: "--secondary", label: "Secondary", fallback: "#e63946", fallbackDark: "#ff4d5e" },
      {
        key: "secondaryForeground",
        cssVar: "--secondary-foreground",
        label: "Secondary foreground",
        fallback: "#ffffff",
        fallbackDark: "#ffffff",
      },
      { key: "accent", cssVar: "--accent", label: "Accent", fallback: "#e63946", fallbackDark: "#ff4d5e" },
      {
        key: "accentForeground",
        cssVar: "--accent-foreground",
        label: "Accent foreground",
        fallback: "#ffffff",
        fallbackDark: "#ffffff",
      },
    ],
  },
  {
    id: "ui",
    title: "UI",
    description: "Dividers, focus rings and the dim behind modals.",
    tokens: [
      { key: "border", cssVar: "--border", label: "Border", fallback: "#e5e7eb", fallbackDark: "rgba(255,255,255,0.12)" },
      { key: "ring", cssVar: "--ring", label: "Focus ring", fallback: "#e63946", fallbackDark: "#ff4d5e" },
      {
        key: "overlay",
        cssVar: "--overlay",
        label: "Overlay",
        fallback: "#111111",
        fallbackDark: "#000000",
        hint: "Backdrop behind modals and drawers.",
      },
    ],
  },
  {
    id: "status",
    title: "Status",
    description: "Feedback colors for toasts, badges and alerts.",
    tokens: [
      { key: "success", cssVar: "--success", label: "Success", fallback: "#22c55e", fallbackDark: "#4ade80" },
      { key: "warning", cssVar: "--warning", label: "Warning", fallback: "#f59e0b", fallbackDark: "#fbbf24" },
      { key: "danger", cssVar: "--danger", label: "Danger", fallback: "#ef4444", fallbackDark: "#f87171" },
      { key: "info", cssVar: "--info", label: "Info", fallback: "#3b82f6", fallbackDark: "#60a5fa" },
    ],
  },
  {
    id: "buttons",
    title: "Buttons",
    description: "Leave blank to follow the brand colors above.",
    tokens: [
      {
        key: "buttonPrimaryBg",
        cssVar: "--button-primary-bg",
        label: "Primary button",
        fallback: "#111111",
        derivesFrom: "primary",
      },
      {
        key: "buttonPrimaryHover",
        cssVar: "--button-primary-hover",
        label: "Primary button hover",
        fallback: "#2b2b2b",
        derivesFrom: "primary",
      },
      {
        key: "buttonSecondaryBg",
        cssVar: "--button-secondary-bg",
        label: "Secondary button",
        fallback: "#e63946",
        derivesFrom: "secondary",
      },
      {
        key: "buttonSecondaryHover",
        cssVar: "--button-secondary-hover",
        label: "Secondary button hover",
        fallback: "#cf333f",
        derivesFrom: "secondary",
      },
    ],
  },
  {
    id: "navbar",
    title: "Navbar",
    description: "The sticky storefront header.",
    tokens: [
      { key: "navbarBg", cssVar: "--navbar-bg", label: "Background", fallback: "#f8f7f4", derivesFrom: "background" },
      { key: "navbarText", cssVar: "--navbar-text", label: "Text", fallback: "#111111", derivesFrom: "foreground" },
      { key: "navbarHover", cssVar: "--navbar-hover", label: "Hover", fallback: "#e63946", derivesFrom: "secondary" },
      { key: "navbarActive", cssVar: "--navbar-active", label: "Active", fallback: "#111111", derivesFrom: "foreground" },
    ],
  },
  {
    id: "footer",
    title: "Footer",
    description: "The closing band beneath every page.",
    tokens: [
      { key: "footerBg", cssVar: "--footer-bg", label: "Background", fallback: "#ffffff", derivesFrom: "surface" },
      { key: "footerText", cssVar: "--footer-text", label: "Text", fallback: "#111111", derivesFrom: "foreground" },
      { key: "footerLink", cssVar: "--footer-link", label: "Links", fallback: "#111111", derivesFrom: "foreground" },
    ],
  },
  {
    id: "cards",
    title: "Cards",
    description: "Product tiles, panels and admin cards.",
    tokens: [
      { key: "cardBg", cssVar: "--card-bg", label: "Background", fallback: "#ffffff", derivesFrom: "surface" },
      { key: "cardBorder", cssVar: "--card-border", label: "Border", fallback: "#e5e7eb", derivesFrom: "border" },
      {
        key: "cardShadow",
        cssVar: "--card-shadow-color",
        label: "Shadow",
        fallback: "#000000",
        hint: "Tinted automatically — only the hue is used.",
      },
    ],
  },
  {
    id: "inputs",
    title: "Inputs",
    description: "Text fields, selects and textareas.",
    tokens: [
      { key: "inputBg", cssVar: "--input-bg", label: "Background", fallback: "#f3f3f3", derivesFrom: "surfaceElevated" },
      { key: "inputBorder", cssVar: "--input-border", label: "Border", fallback: "#e5e7eb", derivesFrom: "border" },
      {
        key: "inputPlaceholder",
        cssVar: "--input-placeholder",
        label: "Placeholder",
        fallback: "#6b7280",
        derivesFrom: "muted",
      },
      {
        key: "inputFocusBorder",
        cssVar: "--input-focus-border",
        label: "Focus border",
        fallback: "#e63946",
        derivesFrom: "secondary",
      },
    ],
  },
] as const satisfies readonly ThemeTokenGroup[];

export const THEME_TOKENS: readonly ThemeTokenDef[] = THEME_GROUPS.flatMap(
  (group) => group.tokens as readonly ThemeTokenDef[]
);

export type ThemeTokenKey = (typeof THEME_GROUPS)[number]["tokens"][number]["key"];

/** Built-in light-mode value per token — the picker's starting swatch. */
export const THEME_FALLBACKS = Object.fromEntries(
  THEME_TOKENS.map((token) => [token.key, token.fallback])
) as Record<ThemeTokenKey, string>;

/** A single palette — every token, blank meaning "use the built-in value". */
export type ThemePalette = Partial<Record<ThemeTokenKey, string>>;

/** The built-in value for a token in a given mode. */
export function builtInValue(token: ThemeTokenDef, mode: ThemeMode): string {
  return mode === "dark" && token.fallbackDark ? token.fallbackDark : token.fallback;
}

/**
 * Every token resolved to a concrete color for one mode: the admin's value
 * where set, otherwise the core token it derives from, otherwise the built-in.
 * The live preview and the contrast checks both need real colors — a blank
 * token in the editor still paints something on the storefront.
 */
export function resolveThemePalette(
  palette: ThemePalette,
  mode: ThemeMode
): Record<ThemeTokenKey, string> {
  const out = {} as Record<ThemeTokenKey, string>;

  // Core tokens first, so component tokens can point at a settled value.
  for (const token of THEME_TOKENS) {
    const key = token.key as ThemeTokenKey;
    const set = palette[key]?.trim();
    if (set) out[key] = set;
    else if (!token.derivesFrom) out[key] = builtInValue(token, mode);
  }

  for (const token of THEME_TOKENS) {
    const key = token.key as ThemeTokenKey;
    if (out[key]) continue;
    const source = token.derivesFrom as ThemeTokenKey | undefined;
    out[key] = (source && out[source]) || builtInValue(token, mode);
  }

  return out;
}

/** Relative luminance (WCAG) of a 3- or 6-digit hex, or null if unparseable. */
export function hexLuminance(hex: string): number | null {
  const value = hex.trim().replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  const channels = [0, 2, 4].map((offset) => {
    const c = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** WCAG contrast ratio between two hex colors, or null if either is unparseable. */
export function contrastRatio(a: string, b: string): number | null {
  const la = hexLuminance(a);
  const lb = hexLuminance(b);
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Legacy `branding.*Color` fields mapped onto their theme token, with the
 * default they carried. A stored value equal to that default was never applied
 * to the storefront (the old generator skipped unchanged colors), so migrating
 * it would change how a live site looks — those are left unset instead.
 */
export const LEGACY_BRANDING_COLORS = [
  { legacyKey: "primaryColor", token: "primary", legacyDefault: "#000000" },
  { legacyKey: "secondaryColor", token: "secondary", legacyDefault: "#ad7d56" },
  { legacyKey: "accentColor", token: "accent", legacyDefault: "#c2916a" },
  { legacyKey: "successColor", token: "success", legacyDefault: "#3f7a4e" },
  { legacyKey: "errorColor", token: "danger", legacyDefault: "#b3402f" },
] as const;
