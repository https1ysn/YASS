import type { Metadata } from "next";
import { ProductForm } from "@/components/admin";
import { getAdminCategories } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "New product" };

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New product</h1>
        <p className="text-muted text-sm">
          A placeholder gallery is assigned automatically — imagery management comes later.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
