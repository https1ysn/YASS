import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin";

export const metadata: Metadata = { title: "New category" };

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="animate-slide-up flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New category</h1>
        <p className="text-muted text-sm">
          A new world for the maison — name it, give it an image and set where it appears.
        </p>
      </div>
      <CategoryForm />
    </div>
  );
}
