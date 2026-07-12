"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ColorField } from "./color-field";
import { siteSettingsSchema, type SiteSettings } from "@/schemas/admin-settings";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  ACCEPTED_IMAGE_ATTR,
  MAX_IMAGE_SIZE_MB,
  settingsImagePath,
  uploadProductImage,
  validateImageFile,
} from "@/lib/supabase/storage";
import { saveSettings } from "@/app/admin/(panel)/settings/actions";

/* ------------------------------------------------------------------ helpers */

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="animate-fade-in flex scroll-mt-24 flex-col gap-5 p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
        {description && <p className="text-muted text-sm leading-relaxed">{description}</p>}
      </div>
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

/** Small image uploader used for the logo, favicon and OG image. */
function ImageField({
  label,
  hint,
  kind,
  value,
  aspect,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  kind: string;
  value: string | null;
  aspect: "square" | "wide";
  onChange: (url: string | null) => void;
  disabled?: boolean;
}) {
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const uploading = progress !== null;

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
      setError(invalid);
      toast({ title: "Couldn't upload the image", description: invalid, variant: "danger" });
      return;
    }
    setError(null);
    setProgress(0);
    try {
      const url = await uploadProductImage(file, settingsImagePath(kind, file), setProgress);
      onChange(url);
      toast({ title: "Image uploaded", description: file.name, variant: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
      toast({ title: "Couldn't upload the image", description: message, variant: "danger" });
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-foreground text-sm font-medium tracking-wide">{label}</span>
      <div className="flex flex-wrap items-start gap-5">
        <span
          className={cn(
            "border-border bg-surface-elevated relative shrink-0 overflow-hidden rounded-xl border",
            aspect === "square" ? "size-20" : "aspect-[16/6] w-40"
          )}
        >
          {uploading ? (
            <Skeleton className="absolute inset-0 rounded-none" />
          ) : value ? (
            <Image
              src={value}
              alt={label}
              fill
              sizes="160px"
              className={aspect === "square" ? "object-contain p-2" : "object-contain p-2"}
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
              onClick={() => inputRef.current?.click()}
              disabled={uploading || disabled}
            >
              {value ? "Replace" : "Upload"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                disabled={uploading || disabled}
                className="text-danger hover:bg-danger/10"
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-muted text-xs leading-relaxed">
            {hint} JPEG, PNG, WebP or AVIF · up to {MAX_IMAGE_SIZE_MB} MB.
          </p>
          {uploading && (
            <div className="flex max-w-60 flex-col gap-1.5">
              <div
                role="progressbar"
                aria-valuenow={progress ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Uploading ${label}`}
                className="bg-foreground/10 h-1 overflow-hidden rounded-full"
              >
                <div
                  className="bg-secondary h-full rounded-full transition-all"
                  style={{ width: `${progress ?? 0}%` }}
                />
              </div>
              <p className="text-muted text-[11px]">{progress}%</p>
            </div>
          )}
          {error && <p className="text-danger text-sm">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_ATTR}
        className="sr-only"
        aria-label={`Upload ${label}`}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------- form */

export interface SettingsFormProps {
  settings: SiteSettings;
}

type Section = keyof SiteSettings;

/**
 * The Website Settings dashboard — every global storefront configuration,
 * grouped into nine sections and saved as one blob through the admin RPC.
 */
export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<SiteSettings>(() => settings);
  // The shipping threshold is edited as text so the field can be cleared.
  const [thresholdText, setThresholdText] = React.useState(
    () => String(settings.store.freeShippingThreshold)
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  function update<S extends Section, K extends keyof SiteSettings[S]>(
    section: S,
    key: K,
    value: SiteSettings[S][K]
  ) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  function err(section: Section, key: string): string | undefined {
    return errors[`${section}.${key}`];
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const payload: SiteSettings = {
      ...form,
      store: {
        ...form.store,
        freeShippingThreshold:
          thresholdText.trim() === "" ? Number.NaN : Number(thresholdText),
      },
    };

    const parsed = siteSettingsSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast({ title: "Please check the highlighted fields", variant: "warning" });
      return;
    }

    setErrors({});
    setSaving(true);
    const result = await saveSettings(parsed.data);
    setSaving(false);

    if (!result.ok) {
      toast({ title: "Couldn't save settings", description: result.error, variant: "danger" });
      return;
    }

    toast({ title: "Settings saved", description: "Your storefront is updated.", variant: "success" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 sm:gap-6">
      {/* 1. General */}
      <FormSection title="General" description="Your store's identity across the storefront.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Store name"
            value={form.general.storeName}
            onChange={(e) => update("general", "storeName", e.target.value)}
            placeholder="Yasso Store"
            error={err("general", "storeName")}
          />
          <Input
            label="Store tagline"
            value={form.general.tagline}
            onChange={(e) => update("general", "tagline", e.target.value)}
            placeholder="Timeless essentials, made to last."
            error={err("general", "tagline")}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <ImageField
            label="Logo"
            kind="logo"
            hint="Shown in the header and footer."
            aspect="wide"
            value={form.general.logoUrl}
            onChange={(url) => update("general", "logoUrl", url)}
            disabled={saving}
          />
          <ImageField
            label="Favicon"
            kind="favicon"
            hint="The browser-tab icon — a square PNG works best."
            aspect="square"
            value={form.general.faviconUrl}
            onChange={(url) => update("general", "faviconUrl", url)}
            disabled={saving}
          />
        </div>
      </FormSection>

      {/* 2. Branding */}
      <FormSection
        title="Branding"
        description="Brand colors flow into the storefront's design tokens automatically."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ColorField
            label="Primary color"
            value={form.branding.primaryColor}
            onChange={(v) => update("branding", "primaryColor", v)}
            error={err("branding", "primaryColor")}
          />
          <ColorField
            label="Secondary color"
            value={form.branding.secondaryColor}
            onChange={(v) => update("branding", "secondaryColor", v)}
            error={err("branding", "secondaryColor")}
          />
          <ColorField
            label="Accent color"
            value={form.branding.accentColor}
            onChange={(v) => update("branding", "accentColor", v)}
            error={err("branding", "accentColor")}
          />
          <ColorField
            label="Success color"
            value={form.branding.successColor}
            onChange={(v) => update("branding", "successColor", v)}
            error={err("branding", "successColor")}
          />
          <ColorField
            label="Error color"
            value={form.branding.errorColor}
            onChange={(v) => update("branding", "errorColor", v)}
            error={err("branding", "errorColor")}
          />
        </div>
      </FormSection>

      {/* 3. Announcement Bar */}
      <FormSection title="Announcement bar" description="The slim promo banner above the header.">
        <Toggle
          label="Enable announcement bar"
          hint="Show a promotional message at the very top of every page."
          checked={form.announcement.enabled}
          onChange={(v) => update("announcement", "enabled", v)}
        />
        <Textarea
          label="Text"
          rows={2}
          value={form.announcement.text}
          onChange={(e) => update("announcement", "text", e.target.value)}
          placeholder="Free shipping on orders over $150."
          error={err("announcement", "text")}
        />
        <Input
          label="Link (optional)"
          value={form.announcement.link}
          onChange={(e) => update("announcement", "link", e.target.value)}
          placeholder="/shop"
          hint="Where the banner sends shoppers when clicked."
          error={err("announcement", "link")}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField
            label="Background color"
            value={form.announcement.backgroundColor}
            onChange={(v) => update("announcement", "backgroundColor", v)}
            error={err("announcement", "backgroundColor")}
          />
          <ColorField
            label="Text color"
            value={form.announcement.textColor}
            onChange={(v) => update("announcement", "textColor", v)}
            error={err("announcement", "textColor")}
          />
        </div>
      </FormSection>

      {/* 4. Contact Information */}
      <FormSection title="Contact information" description="How customers reach you.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={form.contact.email}
            onChange={(e) => update("contact", "email", e.target.value)}
            placeholder="hello@yasso.store"
            error={err("contact", "email")}
          />
          <Input
            label="Phone"
            value={form.contact.phone}
            onChange={(e) => update("contact", "phone", e.target.value)}
            placeholder="+212 600 000 000"
            error={err("contact", "phone")}
          />
          <Input
            label="WhatsApp"
            value={form.contact.whatsapp}
            onChange={(e) => update("contact", "whatsapp", e.target.value)}
            placeholder="+212 600 000 000"
            error={err("contact", "whatsapp")}
          />
          <Input
            label="Address"
            value={form.contact.address}
            onChange={(e) => update("contact", "address", e.target.value)}
            placeholder="123 Avenue Mohammed V, Casablanca"
            error={err("contact", "address")}
          />
        </div>
      </FormSection>

      {/* 5. Social Media */}
      <FormSection title="Social media" description="Profile links shown in the footer.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Instagram"
            value={form.social.instagram}
            onChange={(e) => update("social", "instagram", e.target.value)}
            placeholder="https://instagram.com/yourbrand"
            error={err("social", "instagram")}
          />
          <Input
            label="Facebook"
            value={form.social.facebook}
            onChange={(e) => update("social", "facebook", e.target.value)}
            placeholder="https://facebook.com/yourbrand"
            error={err("social", "facebook")}
          />
          <Input
            label="TikTok"
            value={form.social.tiktok}
            onChange={(e) => update("social", "tiktok", e.target.value)}
            placeholder="https://tiktok.com/@yourbrand"
            error={err("social", "tiktok")}
          />
          <Input
            label="X"
            value={form.social.x}
            onChange={(e) => update("social", "x", e.target.value)}
            placeholder="https://x.com/yourbrand"
            error={err("social", "x")}
          />
          <Input
            label="YouTube"
            value={form.social.youtube}
            onChange={(e) => update("social", "youtube", e.target.value)}
            placeholder="https://youtube.com/@yourbrand"
            error={err("social", "youtube")}
          />
          <Input
            label="LinkedIn"
            value={form.social.linkedin}
            onChange={(e) => update("social", "linkedin", e.target.value)}
            placeholder="https://linkedin.com/company/yourbrand"
            error={err("social", "linkedin")}
          />
        </div>
      </FormSection>

      {/* 6. Store */}
      <FormSection title="Store" description="Commerce defaults for pricing and shipping.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Currency"
            value={form.store.currency}
            onChange={(e) => update("store", "currency", e.target.value)}
            placeholder="USD"
            hint="ISO code, e.g. USD, EUR, MAD."
            error={err("store", "currency")}
          />
          <Input
            label="Currency symbol"
            value={form.store.currencySymbol}
            onChange={(e) => update("store", "currencySymbol", e.target.value)}
            placeholder="$"
            error={err("store", "currencySymbol")}
          />
          <Input
            label="Free shipping threshold"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={thresholdText}
            onChange={(e) => setThresholdText(e.target.value)}
            placeholder="150"
            error={err("store", "freeShippingThreshold")}
          />
          <Select
            label="Default language"
            value={form.store.defaultLanguage}
            onChange={(e) =>
              update("store", "defaultLanguage", e.target.value as SiteSettings["store"]["defaultLanguage"])
            }
            error={err("store", "defaultLanguage")}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </Select>
          <Input
            label="Default country"
            value={form.store.defaultCountry}
            onChange={(e) => update("store", "defaultCountry", e.target.value)}
            placeholder="Morocco"
            error={err("store", "defaultCountry")}
          />
        </div>
      </FormSection>

      {/* 7. Homepage */}
      <FormSection title="Homepage" description="Headline copy across the home page. Leave blank to use the built-in translations.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Hero title"
            value={form.homepage.heroTitle}
            onChange={(e) => update("homepage", "heroTitle", e.target.value)}
            error={err("homepage", "heroTitle")}
          />
          <Input
            label="Hero button text"
            value={form.homepage.heroButtonText}
            onChange={(e) => update("homepage", "heroButtonText", e.target.value)}
            error={err("homepage", "heroButtonText")}
          />
        </div>
        <Textarea
          label="Hero subtitle"
          rows={2}
          value={form.homepage.heroSubtitle}
          onChange={(e) => update("homepage", "heroSubtitle", e.target.value)}
          error={err("homepage", "heroSubtitle")}
        />
        <Input
          label="Hero button link"
          value={form.homepage.heroButtonLink}
          onChange={(e) => update("homepage", "heroButtonLink", e.target.value)}
          placeholder="/shop"
          error={err("homepage", "heroButtonLink")}
        />
        <Textarea
          label="CTA banner"
          rows={2}
          value={form.homepage.ctaBanner}
          onChange={(e) => update("homepage", "ctaBanner", e.target.value)}
          error={err("homepage", "ctaBanner")}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Newsletter title"
            value={form.homepage.newsletterTitle}
            onChange={(e) => update("homepage", "newsletterTitle", e.target.value)}
            error={err("homepage", "newsletterTitle")}
          />
          <Input
            label="Footer text"
            value={form.homepage.footerText}
            onChange={(e) => update("homepage", "footerText", e.target.value)}
            error={err("homepage", "footerText")}
          />
        </div>
        <Textarea
          label="Newsletter description"
          rows={2}
          value={form.homepage.newsletterDescription}
          onChange={(e) => update("homepage", "newsletterDescription", e.target.value)}
          error={err("homepage", "newsletterDescription")}
        />
      </FormSection>

      {/* 8. SEO */}
      <FormSection title="SEO" description="How the store appears in search results and shared links.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Website title"
            value={form.seo.websiteTitle}
            onChange={(e) => update("seo", "websiteTitle", e.target.value)}
            hint="The browser-tab title template."
            error={err("seo", "websiteTitle")}
          />
          <Input
            label="Default meta title"
            value={form.seo.metaTitle}
            onChange={(e) => update("seo", "metaTitle", e.target.value)}
            error={err("seo", "metaTitle")}
          />
        </div>
        <Textarea
          label="Default meta description"
          rows={2}
          value={form.seo.metaDescription}
          onChange={(e) => update("seo", "metaDescription", e.target.value)}
          error={err("seo", "metaDescription")}
        />
        <ImageField
          label="Default Open Graph image"
          kind="og"
          hint="Shown when the store is shared on social — 1200×630 works best."
          aspect="wide"
          value={form.seo.ogImageUrl}
          onChange={(url) => update("seo", "ogImageUrl", url)}
          disabled={saving}
        />
      </FormSection>

      {/* 9. Advanced */}
      <FormSection title="Advanced" description="Take the storefront offline for maintenance.">
        <Toggle
          label="Maintenance mode"
          hint="Replaces the storefront with a maintenance notice. The admin dashboard stays accessible."
          checked={form.advanced.maintenanceMode}
          onChange={(v) => update("advanced", "maintenanceMode", v)}
        />
        <Textarea
          label="Maintenance message"
          rows={2}
          value={form.advanced.maintenanceMessage}
          onChange={(e) => update("advanced", "maintenanceMessage", e.target.value)}
          error={err("advanced", "maintenanceMessage")}
        />
      </FormSection>

      {/* Sticky save bar */}
      <div className="glass sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl p-3.5 sm:bottom-6">
        <p className="text-muted mr-auto pl-1 text-xs sm:text-sm">
          Changes apply to the storefront right after saving.
        </p>
        <Button type="submit" isLoading={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
