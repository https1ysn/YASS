"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ColorField } from "./color-field";
import {
  builtInValue,
  contrastRatio,
  resolveThemePalette,
  THEME_GROUPS,
  THEME_TOKENS,
  type ThemeMode,
  type ThemePalette,
  type ThemeTokenDef,
  type ThemeTokenKey,
} from "@/lib/theme-tokens";
import type { ThemeSettings } from "@/schemas/admin-settings";

const MODES: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

/* ----------------------------------------------------------------- preview */

/**
 * The pending palette as inline custom properties, with EVERY token resolved to
 * a concrete color for the previewed mode.
 *
 * Emitting only the overrides would be wrong here: the blanks would inherit the
 * admin dashboard's own palette, so a dark preview would sit on light surfaces.
 * Resolving in full makes the panel self-contained and lets Light and Dark be
 * compared side by side whatever mode the dashboard itself is in.
 */
function previewStyle(palette: ThemePalette, mode: ThemeMode): React.CSSProperties {
  const resolved = resolveThemePalette(palette, mode);
  const style: Record<string, string> = {};
  for (const token of THEME_TOKENS) {
    style[token.cssVar] = resolved[token.key as ThemeTokenKey];
  }
  return style as React.CSSProperties;
}

/**
 * A miniature storefront that re-renders on every keystroke. Scoped to this
 * element rather than the whole dashboard: the admin stays readable even while
 * a half-typed color is in the field, and nothing is committed until Save.
 */
function ThemePreview({ palette, mode }: { palette: ThemePalette; mode: ThemeMode }) {
  return (
    <div
      style={previewStyle(palette, mode)}
      className="border-border overflow-hidden rounded-2xl border"
      aria-label="Theme preview"
    >
      {/* navbar */}
      <div className="bg-navbar text-navbar-text flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3">
        <span className="text-navbar-active text-sm font-bold tracking-[0.18em] uppercase">
          Store
        </span>
        <nav className="flex gap-4 text-xs font-medium">
          <span className="text-navbar-active">Shop</span>
          <span className="text-navbar-hover">Collections</span>
        </nav>
      </div>

      {/* body */}
      <div className="bg-background flex flex-col gap-4 p-4">
        <div className="bg-card border-card-border shadow-card flex flex-col gap-3 rounded-xl border p-4">
          <p className="text-foreground text-sm font-semibold">Featured piece</p>
          <p className="text-muted text-xs leading-relaxed">
            Muted supporting copy sits beneath the heading.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-button-primary text-primary-foreground rounded-full px-3.5 py-1.5 text-xs font-semibold">
              Primary
            </span>
            <span className="bg-button-secondary text-secondary-foreground rounded-full px-3.5 py-1.5 text-xs font-semibold">
              Secondary
            </span>
            <span className="bg-accent text-accent-foreground rounded-full px-3.5 py-1.5 text-xs font-semibold">
              Accent
            </span>
          </div>
          <div className="bg-input border-input-border text-foreground flex h-9 items-center rounded-xl border px-3 text-xs">
            <span className="text-input-placeholder">Search the maison…</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["Success", "bg-success"],
              ["Warning", "bg-warning"],
              ["Danger", "bg-danger"],
              ["Info", "bg-info"],
            ] as const
          ).map(([label, background]) => (
            <span
              key={label}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase",
                background
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* footer */}
      <div className="bg-footer text-footer-text flex items-center justify-between gap-4 border-t border-[var(--border)] px-4 py-3">
        <span className="text-xs font-medium">© {new Date().getFullYear()} Store</span>
        <span className="text-footer-link text-xs underline underline-offset-4">Contact</span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- contrast */

/** Text/surface pairs that must stay legible whatever the admin picks. */
const CONTRAST_PAIRS = [
  { text: "foreground", surface: "background", label: "Body text on background" },
  { text: "muted", surface: "background", label: "Muted text on background" },
  { text: "foreground", surface: "cardBg", label: "Text on cards" },
  { text: "primaryForeground", surface: "buttonPrimaryBg", label: "Primary button label" },
  { text: "secondaryForeground", surface: "buttonSecondaryBg", label: "Secondary button label" },
  { text: "navbarText", surface: "navbarBg", label: "Navbar text" },
  { text: "footerText", surface: "footerBg", label: "Footer text" },
  { text: "inputPlaceholder", surface: "inputBg", label: "Input placeholder" },
] as const;

/**
 * Contrast checks against the *effective* colors — an overridden value where
 * the admin set one, the built-in light value otherwise. This is what catches
 * a half-finished pair (a pinned background with the default foreground) before
 * it ships.
 */
function contrastWarnings(palette: ThemePalette, mode: ThemeMode) {
  const resolved = resolveThemePalette(palette, mode);

  return CONTRAST_PAIRS.flatMap((pair) => {
    const ratio = contrastRatio(
      resolved[pair.text as ThemeTokenKey],
      resolved[pair.surface as ThemeTokenKey]
    );
    if (ratio === null || ratio >= 4.5) return [];
    return [{ ...pair, ratio }];
  });
}

/* ------------------------------------------------------------------ editor */

export interface ThemeEditorProps {
  theme: ThemeSettings;
  onChange: (mode: ThemeMode, key: ThemeTokenKey, value: string) => void;
  /** Clears every token of one mode back to the built-in palette. */
  onResetMode: (mode: ThemeMode) => void;
  /** Replaces `to` with a copy of `from`. */
  onCopyMode: (from: ThemeMode, to: ThemeMode) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

/**
 * The Theme section of Website Settings — two independent palettes behind a
 * Light/Dark tab strip, every design token grouped by the surface it paints,
 * each with a picker, a hex field and a reset. The preview follows the selected
 * tab, so Dark can be designed without switching the dashboard into dark mode
 * and without saving anything.
 */
export function ThemeEditor({
  theme,
  onChange,
  onResetMode,
  onCopyMode,
  disabled,
  errors = {},
}: ThemeEditorProps) {
  const [mode, setMode] = React.useState<ThemeMode>("light");
  const other: ThemeMode = mode === "light" ? "dark" : "light";
  const palette = theme[mode];

  const countFor = (target: ThemeMode) =>
    THEME_TOKENS.filter((token) => theme[target][token.key as ThemeTokenKey]?.trim()).length;

  const overridden = countFor(mode);
  const warnings = contrastWarnings(palette, mode);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <Card className="animate-fade-in flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">Theme</h2>
          <p className="text-muted text-sm leading-relaxed">
            Light and Dark carry their own palette. A field left blank keeps the built-in color
            for that mode, so you only need to set what you actually want to change.
          </p>
        </div>

        {/* mode tabs */}
        <div
          role="tablist"
          aria-label="Theme mode"
          className="border-border bg-surface-elevated flex w-fit gap-1 rounded-xl border p-1"
        >
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              onClick={() => setMode(item.id)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                mode === item.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              {item.label}
              {countFor(item.id) > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">{countFor(item.id)}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onResetMode(mode)}
            disabled={disabled || overridden === 0}
          >
            Reset {MODES.find((m) => m.id === mode)?.label}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onCopyMode(mode, other)}
            disabled={disabled || overridden === 0}
          >
            Copy {mode === "light" ? "Light → Dark" : "Dark → Light"}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
            Live preview — {mode}
          </p>
          <ThemePreview palette={palette} mode={mode} />
        </div>

        {warnings.length > 0 && (
          <Alert variant="warning" title={`Low contrast in ${mode} mode`}>
            <ul className="flex flex-col gap-1">
              {warnings.map((warning) => (
                <li key={warning.label} className="text-sm">
                  {warning.label} — {warning.ratio.toFixed(2)}:1 (WCAG AA needs 4.5:1)
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              Colors are usually pairs: setting a background without its text color leaves the
              other half on its default.
            </p>
          </Alert>
        )}
      </Card>

      {THEME_GROUPS.map((group) => (
        <Card key={group.id} className="animate-fade-in flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold tracking-tight sm:text-base">{group.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{group.description}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(group.tokens as readonly ThemeTokenDef[]).map((token) => {
              const key = token.key as ThemeTokenKey;
              return (
                <ColorField
                  key={token.key}
                  label={token.label}
                  hint={token.hint}
                  value={palette[key] ?? ""}
                  defaultValue={builtInValue(token, mode)}
                  onChange={(value) => onChange(mode, key, value)}
                  onReset={() => onChange(mode, key, "")}
                  disabled={disabled}
                  error={errors[`theme.${mode}.${token.key}`]}
                />
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
