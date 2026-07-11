"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { deleteProduct } from "@/app/admin/(panel)/products/actions";

const menuItemClasses =
  "block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground";

/** Per-row kebab menu: Edit link + Delete with confirmation modal. */
export function ProductRowActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function confirmDelete() {
    setDeleting(true);
    const result = await deleteProduct(id);
    setDeleting(false);
    if (!result.ok) {
      toast({ title: "Couldn't delete the product", description: result.error, variant: "danger" });
      return;
    }
    setConfirmOpen(false);
    toast({ title: "Product deleted", description: name, variant: "success" });
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "text-muted grid size-9 place-items-center rounded-xl transition-colors",
          "hover:bg-foreground/5 hover:text-foreground",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
        )}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4.5">
          <circle cx="10" cy="4.5" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="15.5" r="1.5" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`Actions for ${name}`}
          onClick={() => setOpen(false)}
          className="animate-scale-in border-border bg-surface-elevated shadow-elevated absolute top-full right-0 z-20 mt-1.5 w-40 rounded-2xl border p-1.5"
        >
          <Link role="menuitem" href={`/admin/products/${id}/edit`} className={menuItemClasses}>
            Edit
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => setConfirmOpen(true)}
            className={cn(menuItemClasses, "hover:bg-danger/10 hover:text-danger")}
          >
            Delete
          </button>
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        size="sm"
        title="Delete product"
        description={`"${name}" will be removed from the catalog. Past orders keep their records.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              isLoading={deleting}
              className="bg-danger hover:bg-danger/85"
            >
              Delete product
            </Button>
          </>
        }
      >
        <p className="text-muted text-sm leading-relaxed">
          This can&apos;t be undone. The product and its images are permanently deleted.
        </p>
      </Modal>
    </div>
  );
}
