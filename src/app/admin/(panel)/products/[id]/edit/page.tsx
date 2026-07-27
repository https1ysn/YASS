import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm, ProductGalleryManager } from "@/components/admin";
import {
  getAdminCategories,
  getAdminProductById,
  getAdminSizeOptions,
} from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Edit product" };

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, sizes] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
    getAdminSizeOptions(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit product</h1>
        <p className="text-muted text-sm">{product.name}</p>
      </div>
      <ProductForm categories={categories} sizes={sizes} product={product} />
      <ProductGalleryManager
        productId={product.id}
        productName={product.name}
        images={product.images}
      />
    </div>
  );
}
