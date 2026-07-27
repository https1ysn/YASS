"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, slugify } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { filterColors } from "@/constants/shop";
import { adminProductSchema, HEX_COLOR_RE } from "@/schemas/admin-product";
import type { AdminCategory, AdminProduct } from "@/lib/supabase/admin";
import type { AdminSize } from "@/schemas/admin-size";
import { saveProduct } from "@/app/admin/(panel)/products/actions";

type BadgeValue = "New" | "Best Seller" | "Sale" | null;

const DEFAULT_PICKER_COLOR = "#ad7d56";

/** "#abc" → "#aabbcc", lowercased — one canonical form for storage and
 * duplicate checks. Non-hex values (legacy tokens) pass through untouched. */
function normalizeHex(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(trimmed)) {
    return `#${[...trimmed.slice(1)].map((ch) => ch + ch).join("")}`;
  }
  return trimmed;
}

/** Swatch color for a stored value — HEX as-is, legacy tokens via the old palette. */
function swatchHex(value: string): string {
  if (value.startsWith("#")) return value;
  return filterColors.find((color) => color.value === value)?.hex ?? DEFAULT_PICKER_COLOR;
}

/** Human label — legacy tokens keep their name, HEX values read as HEX. */
function swatchLabel(value: string): string {
  if (value.startsWith("#")) return value.toUpperCase();
  return filterColors.find((color) => color.value === value)?.label ?? value;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: string;
  compareAtPrice: string;
  availability: "in-stock" | "made-to-order";
  colors: string[];
  sizes: string[];
  isFeatured: boolean;
  badge: BadgeValue;
}

function initialState(product?: AdminProduct): FormState {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    categoryId: product?.categoryId ?? "",
    price: product != null ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice != null ? String(product.compareAtPrice) : "",
    availability: product?.availability ?? "in-stock",
    colors: product?.colors ?? [],
    sizes: product?.sizes ?? [],
    isFeatured: product?.isFeatured ?? false,
    badge:
      product?.badge === "New" || product?.badge === "Best Seller" || product?.badge === "Sale"
        ? product.badge
        : null,
  };
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="animate-fade-in flex flex-col gap-5 p-6 sm:p-8">
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
      {children}
    </Card>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="border-border bg-surface-elevated hover:border-secondary/50 flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-secondary mt-0.5 size-4 shrink-0 rounded"
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-muted text-xs leading-relaxed">{hint}</span>}
      </span>
    </label>
  );
}

export interface ProductFormProps {
  categories: AdminCategory[];
  /** The global size list (Admin → Sizes) — drives the size checkboxes. */
  sizes: AdminSize[];
  product?: AdminProduct;
}

/** Create/edit product form — Zod-validated, saved through the admin RPC. */
export function ProductForm({ categories, sizes, product }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(() => initialState(product));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const slugTouched = React.useRef(Boolean(product));

  // Color picker — the swatch input always holds a valid HEX; the text field
  // may briefly hold a partial value while typing.
  const [pickerColor, setPickerColor] = React.useState(DEFAULT_PICKER_COLOR);
  const [hexInput, setHexInput] = React.useState(DEFAULT_PICKER_COLOR);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Active sizes from the Sizes page, plus any size this product already
   * carries that has since been hidden or deleted — so editing an older product
   * never silently drops a size the storefront is still showing.
   */
  const sizeOptions = React.useMemo(() => {
    const options = sizes
      .filter((size) => size.active)
      .map((size) => ({ name: size.name, legacy: false }));
    const known = new Set(options.map((option) => option.name));
    const legacy = form.sizes
      .filter((name) => !known.has(name))
      .map((name) => ({ name, legacy: true }));
    return [...options, ...legacy];
  }, [sizes, form.sizes]);

  function toggleSize(name: string, checked: boolean) {
    update(
      "sizes",
      checked ? [...form.sizes, name] : form.sizes.filter((size) => size !== name)
    );
  }

  function setBadge(value: Exclude<BadgeValue, null>, checked: boolean) {
    update("badge", checked ? value : null);
  }

  function setPicker(value: string) {
    setPickerColor(value);
    setHexInput(value);
  }

  function addColor() {
    const value = normalizeHex(hexInput);
    if (!HEX_COLOR_RE.test(value)) {
      toast({
        title: "Enter a valid HEX color",
        description: "e.g. #AD7D56 or #FA0",
        variant: "warning",
      });
      return;
    }
    const duplicate = form.colors.some(
      (color) => normalizeHex(swatchHex(color)) === value || normalizeHex(color) === value
    );
    if (duplicate) {
      toast({ title: "Color already added", description: value.toUpperCase(), variant: "info" });
      return;
    }
    update("colors", [...form.colors, value]);
    setPicker(value);
  }

  function removeColor(value: string) {
    update(
      "colors",
      form.colors.filter((color) => color !== value)
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const payload = {
      id: product?.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      categoryId: form.categoryId,
      price: form.price.trim() === "" ? Number.NaN : Number(form.price),
      compareAtPrice: form.compareAtPrice.trim() === "" ? null : Number(form.compareAtPrice),
      availability: form.availability,
      badge: form.badge,
      colors: form.colors,
      sizes: form.sizes,
      isFeatured: form.isFeatured,
    };

    const parsed = adminProductSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast({ title: "Please check the form", variant: "warning" });
      return;
    }

    setErrors({});
    setSaving(true);
    const result = await saveProduct(parsed.data);

    if (!result.ok) {
      setSaving(false);
      toast({ title: "Couldn't save the product", description: result.error, variant: "danger" });
      return;
    }

    toast({
      title: product ? "Product updated" : "Product created",
      description: form.name,
      variant: "success",
    });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 sm:gap-6">
      <FormSection title="Product details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(event) => {
              update("name", event.target.value);
              if (!slugTouched.current) update("slug", slugify(event.target.value));
            }}
            placeholder="e.g. Silk Wrap Dress"
            error={errors.name}
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(event) => {
              slugTouched.current = event.target.value.length > 0;
              update("slug", slugify(event.target.value));
            }}
            placeholder="silk-wrap-dress"
            hint="Used in the product URL."
            error={errors.slug}
          />
        </div>

        <Textarea
          label="Description"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Fabric, cut, feel — a sentence or two."
          rows={3}
          error={errors.description}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(event) => update("categoryId", event.target.value)}
            error={errors.categoryId}
          >
            <option value="">Choose a category…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={form.availability}
            onChange={(event) =>
              update(
                "availability",
                event.target.value === "made-to-order" ? "made-to-order" : "in-stock"
              )
            }
          >
            <option value="in-stock">In stock</option>
            <option value="made-to-order">Made to order</option>
          </Select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Price"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={form.price}
            onChange={(event) => update("price", event.target.value)}
            placeholder="420"
            error={errors.price}
          />
          <Input
            label="Compare-at price"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={form.compareAtPrice}
            onChange={(event) => update("compareAtPrice", event.target.value)}
            placeholder="Optional — shows a strikethrough"
            error={errors.compareAtPrice}
          />
        </div>
      </FormSection>

      <FormSection title="Variants">
        <div className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">Colors</p>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={pickerColor}
              onChange={(event) => setPicker(event.target.value)}
              aria-label="Pick a color"
              className={cn(
                "border-border bg-surface-elevated shadow-soft h-11 w-14 shrink-0 cursor-pointer rounded-xl border p-1.5 transition-all hover:scale-105",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
              )}
            />
            <div className="w-32">
              <Input
                value={hexInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setHexInput(value);
                  if (HEX_COLOR_RE.test(value.trim())) setPickerColor(normalizeHex(value));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addColor();
                  }
                }}
                placeholder="#AD7D56"
                aria-label="HEX color value"
                className="h-11 font-mono text-sm uppercase"
              />
            </div>
            <Button type="button" variant="outline" onClick={addColor}>
              Add color
            </Button>
          </div>

          {form.colors.length > 0 ? (
            <ul className="flex flex-wrap gap-3 pt-1" aria-label="Selected colors">
              {form.colors.map((color) => {
                const label = swatchLabel(color);
                return (
                  <li key={color} className="group animate-scale-in relative">
                    <span
                      title={label}
                      style={{ backgroundColor: swatchHex(color) }}
                      className="border-border shadow-soft block size-9 rounded-full border transition-transform duration-200 group-hover:scale-110"
                    />
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      aria-label={`Remove color ${label}`}
                      className={cn(
                        "bg-danger absolute -top-1.5 -right-1.5 grid size-4.5 place-items-center rounded-full text-white",
                        "shadow-soft transition-all duration-200 hover:scale-110",
                        "sm:scale-75 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100 sm:focus-visible:scale-100 sm:focus-visible:opacity-100",
                        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
                      )}
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-2.5">
                        <path
                          d="M5 5 15 15M15 5 5 15"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted text-xs leading-relaxed">
              No colors yet — pick one above and add it.
            </p>
          )}
          {errors.colors && <p className="text-danger text-sm">{errors.colors}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">Sizes</p>
            <Link
              href="/admin/sizes"
              className="text-muted hover:text-foreground text-xs underline-offset-4 transition-colors hover:underline"
            >
              Manage sizes
            </Link>
          </div>

          {sizeOptions.length === 0 ? (
            <p className="text-muted text-xs leading-relaxed">
              No sizes available yet —{" "}
              <Link href="/admin/sizes" className="underline underline-offset-4">
                add them on the Sizes page
              </Link>{" "}
              and they will appear here automatically.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2" aria-label="Available sizes">
              {sizeOptions.map((option) => {
                const checked = form.sizes.includes(option.name);
                return (
                  <li key={option.name}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all select-none",
                        checked
                          ? "border-secondary bg-secondary/10 text-foreground"
                          : "border-border bg-surface-elevated text-foreground/75 hover:border-secondary/50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => toggleSize(option.name, event.target.checked)}
                        className="accent-secondary size-4 shrink-0 rounded"
                      />
                      <span className="uppercase">{option.name}</span>
                      {option.legacy && (
                        <span className="text-muted text-[10px] tracking-wide uppercase">
                          retired
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          {errors.sizes && <p className="text-danger text-sm">{errors.sizes}</p>}
        </div>
      </FormSection>

      <FormSection title="Merchandising">
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            label="Featured"
            hint="Marks the piece for curated placements."
            checked={form.isFeatured}
            onChange={(checked) => update("isFeatured", checked)}
          />
          <Toggle
            label="Best seller badge"
            hint="Shows the Best Seller badge on product cards."
            checked={form.badge === "Best Seller"}
            onChange={(checked) => setBadge("Best Seller", checked)}
          />
          <Toggle
            label="New badge"
            hint="Shows the New badge on product cards."
            checked={form.badge === "New"}
            onChange={(checked) => setBadge("New", checked)}
          />
          <Toggle
            label="Sale badge"
            hint="Shows a Sale badge — pairs with a compare-at price."
            checked={form.badge === "Sale"}
            onChange={(checked) => setBadge("Sale", checked)}
          />
        </div>
        <p className="text-muted text-xs leading-relaxed">
          Products carry one badge at a time — selecting a badge replaces the previous one.
        </p>
      </FormSection>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ButtonLink href="/admin/products" variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" isLoading={saving}>
          {saving ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
