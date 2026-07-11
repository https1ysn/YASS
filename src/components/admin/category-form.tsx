"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { adminCategorySchema } from "@/schemas/admin-category";
import type { AdminCategoryDetails } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  ACCEPTED_IMAGE_ATTR,
  MAX_IMAGE_SIZE_MB,
  categoryImagePath,
  uploadProductImage,
  validateImageFile,
} from "@/lib/supabase/storage";
import { saveCategory } from "@/app/admin/(panel)/categories/actions";

interface FormState {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isComingSoon: boolean;
  imageUrl: string | null;
}

function initialState(category?: AdminCategoryDetails): FormState {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    sortOrder: category != null ? String(category.sortOrder) : "0",
    isComingSoon: category?.isComingSoon ?? false,
    imageUrl: category?.imageUrl ?? null,
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

export interface CategoryFormProps {
  category?: AdminCategoryDetails;
}

/** Create/edit category form — Zod-validated, saved through the admin RPC.
 * The image uploads straight to the products bucket with live progress. */
export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(() => initialState(category));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const slugTouched = React.useRef(Boolean(category));
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploading = uploadProgress !== null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(file: File) {
    if (!isSupabaseConfigured) {
      toast({
        title: "Supabase is not configured",
        description: "Check your environment variables.",
        variant: "danger",
      });
      return;
    }
    const invalid = validateImageFile(file);
    if (invalid) {
      setUploadError(invalid);
      toast({ title: "Couldn't upload the image", description: invalid, variant: "danger" });
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    try {
      const url = await uploadProductImage(file, categoryImagePath(file), setUploadProgress);
      update("imageUrl", url);
      toast({ title: "Image uploaded", description: file.name, variant: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      setUploadError(message);
      toast({ title: "Couldn't upload the image", description: message, variant: "danger" });
    } finally {
      setUploadProgress(null);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || uploading) return;

    const payload = {
      id: category?.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      sortOrder: form.sortOrder.trim() === "" ? Number.NaN : Number(form.sortOrder),
      isComingSoon: form.isComingSoon,
      imageUrl: form.imageUrl,
    };

    const parsed = adminCategorySchema.safeParse(payload);
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
    const result = await saveCategory(parsed.data);

    if (!result.ok) {
      setSaving(false);
      toast({ title: "Couldn't save the category", description: result.error, variant: "danger" });
      return;
    }

    toast({
      title: category ? "Category updated" : "Category created",
      description: form.name,
      variant: "success",
    });
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 sm:gap-6">
      <FormSection title="Category details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(event) => {
              update("name", event.target.value);
              if (!slugTouched.current) update("slug", slugify(event.target.value));
            }}
            placeholder="e.g. Summer Capsule"
            error={errors.name}
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(event) => {
              slugTouched.current = event.target.value.length > 0;
              update("slug", slugify(event.target.value));
            }}
            placeholder="summer-capsule"
            hint="Used in the collection URL."
            error={errors.slug}
          />
        </div>

        <Textarea
          label="Description"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="The mood of the collection — a sentence or two."
          rows={3}
          error={errors.description}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Sort order"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={form.sortOrder}
            onChange={(event) => update("sortOrder", event.target.value)}
            placeholder="0"
            hint="Lower numbers appear first."
            error={errors.sortOrder}
          />
        </div>
      </FormSection>

      <FormSection title="Image">
        <div className="flex flex-wrap items-start gap-5">
          <span className="border-border bg-surface-elevated relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-xl border">
            {uploading ? (
              <Skeleton className="absolute inset-0 rounded-none" />
            ) : form.imageUrl ? (
              <Image
                src={form.imageUrl}
                alt={form.name || "Category image"}
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              <span className="text-muted absolute inset-0 grid place-items-center">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                >
                  <rect x="3" y="4" width="14" height="12" rx="2" />
                  <circle cx="7.5" cy="8.5" r="1.25" />
                  <path d="m3.5 14 4-4 3 3 2.5-2.5 3.5 3.5" />
                </svg>
              </span>
            )}
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex flex-wrap gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || saving}
              >
                {form.imageUrl ? "Replace image" : "Upload image"}
              </Button>
              {form.imageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update("imageUrl", null)}
                  disabled={uploading || saving}
                  className="text-danger hover:bg-danger/10"
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-muted text-xs leading-relaxed">
              Shown on the collection tiles across the storefront. JPEG, PNG, WebP or AVIF · up to{" "}
              {MAX_IMAGE_SIZE_MB} MB.
            </p>
            {uploading && (
              <div className="flex max-w-60 flex-col gap-1.5">
                <div
                  role="progressbar"
                  aria-valuenow={uploadProgress ?? 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Uploading image"
                  className="bg-foreground/10 h-1 overflow-hidden rounded-full"
                >
                  <div
                    className="bg-secondary h-full rounded-full transition-all"
                    style={{ width: `${uploadProgress ?? 0}%` }}
                  />
                </div>
                <p className="text-muted text-[11px]">{uploadProgress}%</p>
              </div>
            )}
            {uploadError && <p className="text-danger text-sm">{uploadError}</p>}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_ATTR}
          className="sr-only"
          aria-label="Upload category image"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </FormSection>

      <FormSection title="Visibility">
        <Toggle
          label="Coming soon"
          hint="Shows the collection as an announced, not-yet-shoppable world on the storefront."
          checked={form.isComingSoon}
          onChange={(checked) => update("isComingSoon", checked)}
        />
      </FormSection>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ButtonLink href="/admin/categories" variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" isLoading={saving} disabled={uploading}>
          {saving ? "Saving…" : category ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
