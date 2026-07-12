import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

// Always render the live settings.
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-muted text-sm">
          Every global configuration for your storefront, in one place.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
