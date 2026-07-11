import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin";
import { getAdminCategoryById } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Edit category" };

export const dynamic = "force-dynamic";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit category</h1>
        <p className="text-muted text-sm">
          {category.name} · {category.productCount}{" "}
          {category.productCount === 1 ? "piece" : "pieces"}
        </p>
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
