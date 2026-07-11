import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton mirror of the order details page while it loads. */
export default function AdminOrderLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid items-start gap-4 sm:gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4 sm:gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-44" />
        </div>
        <div className="flex flex-col gap-4 sm:gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-56" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
