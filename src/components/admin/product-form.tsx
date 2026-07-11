"use client";

import * as React from "react";
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
import { adminProductSchema } from "@/schemas/admin-product";
import type { AdminCategory, AdminProduct } from "@/lib/supabase/admin";
import { saveProduct } from "@/app/admin/(panel)/products/actions";

type BadgeValue = "New" | "Best Seller" | "Sale" | null;

interface FormState {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: string;
  compareAtPrice: string;
  availability: "in-stock" | "made-to-order";
  colors: string[];
  sizes: string;
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
    sizes: product?.sizes.join(", ") ?? "",
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
  product?: AdminProduct;
}

/** Create/edit product form — Zod-validated, saved through the admin RPC. */
export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(() => initialState(product));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const slugTouched = React.useRef(Boolean(product));

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setBadge(value: Exclude<BadgeValue, null>, checked: boolean) {
    update("badge", checked ? value : null);
  }

  function toggleColor(value: string) {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(value)
        ? prev.colors.filter((color) => color !== value)
        : [...prev.colors, value],
    }));
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
      sizes: form.sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),
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
          <div className="flex flex-wrap gap-3">
            {filterColors.map((color) => {
              const selected = form.colors.includes(color.value);
              return (
                <button
                  key={color.value}
                  type="button"
                  aria-pressed={selected}
                  title={color.label}
                  onClick={() => toggleColor(color.value)}
                  style={{ backgroundColor: color.hex }}
                  className={cn(
                    "border-border size-9 rounded-full border transition-all hover:scale-110",
                    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    selected && "ring-ring ring-offset-background ring-2 ring-offset-2"
                  )}
                >
                  <span className="sr-only">{color.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Sizes"
          value={form.sizes}
          onChange={(event) => update("sizes", event.target.value)}
          placeholder="XS, S, M, L"
          hint="Comma separated — e.g. XS, S, M, L or 40, 41, 42."
          error={errors.sizes}
        />
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
