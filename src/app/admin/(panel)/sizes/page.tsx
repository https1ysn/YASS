import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { SizesManager } from "@/components/admin";
import { getAdminSizes } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Sizes" };

// Admin lists must always be fresh.
export const dynamic = "force-dynamic";

export default async function AdminSizesPage() {
  const result = await getAdminSizes();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sizes</h1>
        <p className="text-muted text-sm">
          {result.ok
            ? `${result.sizes.length} ${result.sizes.length === 1 ? "size" : "sizes"} available across the catalog.`
            : "One canonical size list for every product."}
        </p>
      </div>

      {!result.ok ? (
        <Alert variant="danger" title="Couldn't load sizes">
          {result.error}
        </Alert>
      ) : (
        <SizesManager sizes={result.sizes} />
      )}
    </div>
  );
}
