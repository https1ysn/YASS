"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import type { AdminProductImage } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { productImagePath, uploadProductImage } from "@/lib/supabase/storage";
import {
  addProductImage,
  deleteProductImage,
  reorderProductImages,
  replaceProductImage,
} from "@/app/admin/(panel)/products/actions";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");
const MAX_SIZE_MB = 5;

interface UploadTask {
  key: number;
  name: string;
  progress: number;
  error?: string;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Use a JPEG, PNG, WebP or AVIF image.";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Keep images under ${MAX_SIZE_MB} MB.`;
  }
  return null;
}

const iconButtonClasses = cn(
  "text-muted grid size-8 place-items-center rounded-lg transition-colors",
  "hover:bg-foreground/5 hover:text-foreground",
  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
  "disabled:pointer-events-none disabled:opacity-40"
);

function ActionIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      {children}
    </svg>
  );
}

export interface ProductGalleryManagerProps {
  productId: string;
  productName: string;
  images: AdminProductImage[];
}

/**
 * Gallery manager for the product edit page. Uploads go straight to the
 * products storage bucket; rows, order and deletions persist through the
 * admin image server actions. The first image is the primary one — the
 * storefront renders the gallery in this order.
 */
export function ProductGalleryManager({
  productId,
  productName,
  images,
}: ProductGalleryManagerProps) {
  const router = useRouter();

  const [items, setItems] = React.useState<AdminProductImage[]>(images);
  const itemsRef = React.useRef(items);
  itemsRef.current = items;
  React.useEffect(() => setItems(images), [images]);

  const [uploads, setUploads] = React.useState<UploadTask[]>([]);
  const nextTaskKey = React.useRef(0);

  const [dragId, setDragId] = React.useState<string | null>(null);
  const dragOrigin = React.useRef<AdminProductImage[] | null>(null);
  const [fileDragOver, setFileDragOver] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<AdminProductImage | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [ordering, setOrdering] = React.useState(false);

  const uploadInputRef = React.useRef<HTMLInputElement>(null);
  const replaceInputRef = React.useRef<HTMLInputElement>(null);
  const replaceTargetId = React.useRef<string | null>(null);

  const busy = ordering || deleting;
  const hasLocalPlaceholders = items.some((image) => image.url.startsWith("/"));

  function patchTask(key: number, patch: Partial<UploadTask>) {
    setUploads((tasks) => tasks.map((task) => (task.key === key ? { ...task, ...patch } : task)));
  }

  /* ------------------------------------------------------------------ upload */

  async function uploadOne(file: File): Promise<boolean> {
    const key = nextTaskKey.current++;
    const invalid = validateFile(file);
    if (invalid) {
      setUploads((tasks) => [...tasks, { key, name: file.name, progress: 0, error: invalid }]);
      return false;
    }

    setUploads((tasks) => [...tasks, { key, name: file.name, progress: 0 }]);
    try {
      const url = await uploadProductImage(file, productImagePath(productId, file), (percent) =>
        patchTask(key, { progress: percent })
      );
      const result = await addProductImage({ productId, url, alt: productName });
      if (!result.ok) throw new Error(result.error);

      setItems((prev) => [...prev, result.image]);
      setUploads((tasks) => tasks.filter((task) => task.key !== key));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      patchTask(key, { error: message });
      return false;
    }
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    if (!isSupabaseConfigured) {
      toast({
        title: "Supabase is not configured",
        description: "Check your environment variables.",
        variant: "danger",
      });
      return;
    }

    const results = await Promise.all(files.map((file) => uploadOne(file)));
    const succeeded = results.filter(Boolean).length;
    const failed = results.length - succeeded;

    if (succeeded > 0) {
      toast({
        title: succeeded === 1 ? "Image uploaded" : `${succeeded} images uploaded`,
        description: productName,
        variant: "success",
      });
      router.refresh();
    }
    if (failed > 0) {
      toast({
        title: failed === 1 ? "One image failed to upload" : `${failed} images failed to upload`,
        description: "See the gallery for details.",
        variant: "danger",
      });
    }
  }

  /* ----------------------------------------------------------------- replace */

  function openReplacePicker(id: string) {
    replaceTargetId.current = id;
    replaceInputRef.current?.click();
  }

  async function handleReplaceFile(file: File) {
    const id = replaceTargetId.current;
    replaceTargetId.current = null;
    if (!id) return;

    const key = nextTaskKey.current++;
    const invalid = validateFile(file);
    if (invalid) {
      toast({ title: "Couldn't replace the image", description: invalid, variant: "danger" });
      return;
    }

    setUploads((tasks) => [...tasks, { key, name: `Replacing — ${file.name}`, progress: 0 }]);
    try {
      const url = await uploadProductImage(file, productImagePath(productId, file), (percent) =>
        patchTask(key, { progress: percent })
      );
      const result = await replaceProductImage({ id, url });
      if (!result.ok) throw new Error(result.error);

      setItems((prev) => prev.map((image) => (image.id === id ? { ...image, url } : image)));
      setUploads((tasks) => tasks.filter((task) => task.key !== key));
      toast({ title: "Image replaced", description: productName, variant: "success" });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      patchTask(key, { error: message });
      toast({ title: "Couldn't replace the image", description: message, variant: "danger" });
    }
  }

  /* ------------------------------------------------------------------ delete */

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteProductImage(deleteTarget.id);
    setDeleting(false);

    if (!result.ok) {
      toast({ title: "Couldn't delete the image", description: result.error, variant: "danger" });
      return;
    }
    setItems((prev) => prev.filter((image) => image.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast({ title: "Image deleted", description: productName, variant: "success" });
    router.refresh();
  }

  /* ----------------------------------------------------------------- reorder */

  async function persistOrder(next: AdminProductImage[], previous: AdminProductImage[]) {
    setOrdering(true);
    const result = await reorderProductImages({
      productId,
      imageIds: next.map((image) => image.id),
    });
    setOrdering(false);

    if (!result.ok) {
      setItems(previous);
      toast({ title: "Couldn't reorder the gallery", description: result.error, variant: "danger" });
      return;
    }
    router.refresh();
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length || busy) return;
    const previous = items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    void persistOrder(next, previous);
  }

  function setPrimary(id: string) {
    if (busy) return;
    const image = items.find((item) => item.id === id);
    if (!image || items[0]?.id === id) return;
    const previous = items;
    const next = [image, ...items.filter((item) => item.id !== id)];
    setItems(next);
    void persistOrder(next, previous);
  }

  function onCardDragStart(event: React.DragEvent, id: string) {
    setDragId(id);
    dragOrigin.current = itemsRef.current;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function onCardDragOver(event: React.DragEvent, overId: string) {
    if (!dragId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragId === overId) return;
    setItems((prev) => {
      const from = prev.findIndex((image) => image.id === dragId);
      const to = prev.findIndex((image) => image.id === overId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function onCardDragEnd() {
    const origin = dragOrigin.current;
    dragOrigin.current = null;
    setDragId(null);
    if (!origin) return;
    const next = itemsRef.current;
    const changed = origin.map((i) => i.id).join() !== next.map((i) => i.id).join();
    if (changed) void persistOrder(next, origin);
  }

  /* ---------------------------------------------------------------- dropzone */

  function isFileDrag(event: React.DragEvent) {
    return Array.from(event.dataTransfer.types).includes("Files");
  }

  return (
    <Card className="animate-fade-in flex flex-col gap-5 p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">Gallery</h2>
        <p className="text-muted text-sm leading-relaxed">
          Drag to reorder — the first image is the primary one shown across the storefront. Changes
          here save instantly.
        </p>
      </div>

      <button
        type="button"
        onClick={() => uploadInputRef.current?.click()}
        onDragOver={(event) => {
          if (!isFileDrag(event)) return;
          event.preventDefault();
          setFileDragOver(true);
        }}
        onDragLeave={() => setFileDragOver(false)}
        onDrop={(event) => {
          if (!isFileDrag(event)) return;
          event.preventDefault();
          setFileDragOver(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-center transition-all",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          fileDragOver
            ? "border-secondary bg-secondary/10"
            : "border-foreground/25 hover:border-secondary/60 hover:bg-foreground/5"
        )}
      >
        <span className="bg-foreground/5 text-muted grid size-12 place-items-center rounded-full">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M10 13.5v-9m0 0L6.5 8M10 4.5 13.5 8" />
            <path d="M4 13.5v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1" />
          </svg>
        </span>
        <p className="text-sm font-medium">
          Drag &amp; drop images here, or <span className="underline underline-offset-4">browse</span>
        </p>
        <p className="text-muted text-xs">
          JPEG, PNG, WebP or AVIF · up to {MAX_SIZE_MB} MB each
        </p>
      </button>

      <input
        ref={uploadInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        className="sr-only"
        aria-label="Upload product images"
        onChange={(event) => {
          if (event.target.files) void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        aria-label="Replace product image"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleReplaceFile(file);
          event.target.value = "";
        }}
      />

      {items.length === 0 && uploads.length === 0 ? (
        <p className="text-muted text-sm leading-relaxed">
          No images yet — upload the first one to give this piece a gallery.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {items.map((image, index) => (
            <li
              key={image.id}
              draggable={!busy}
              onDragStart={(event) => onCardDragStart(event, image.id)}
              onDragOver={(event) => onCardDragOver(event, image.id)}
              onDragEnd={onCardDragEnd}
              onDrop={(event) => event.preventDefault()}
              className={cn(
                "group border-border bg-surface-elevated flex flex-col overflow-hidden rounded-2xl border transition-all",
                dragId === image.id && "ring-ring opacity-60 ring-2"
              )}
            >
              <div className="relative aspect-[4/5] cursor-grab active:cursor-grabbing">
                <Image
                  src={image.url}
                  alt={image.alt ?? productName}
                  fill
                  sizes="(max-width: 640px) 50vw, 240px"
                  className="object-cover"
                  draggable={false}
                />
                {index === 0 && (
                  <Badge variant="secondary" className="absolute top-2 left-2 px-2 py-0.5 text-[10px]">
                    Primary
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-0.5 p-1.5">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || busy}
                    aria-label={`Move image ${index + 1} back`}
                    className={iconButtonClasses}
                  >
                    <ActionIcon>
                      <path d="M12.5 5 7.5 10l5 5" />
                    </ActionIcon>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1 || busy}
                    aria-label={`Move image ${index + 1} forward`}
                    className={iconButtonClasses}
                  >
                    <ActionIcon>
                      <path d="m7.5 5 5 5-5 5" />
                    </ActionIcon>
                  </button>
                </div>
                <div className="flex gap-0.5">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimary(image.id)}
                      disabled={busy}
                      aria-label={`Make image ${index + 1} the primary image`}
                      title="Make primary"
                      className={iconButtonClasses}
                    >
                      <ActionIcon>
                        <path d="m10 3.5 1.9 3.9 4.3.6-3.1 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3.1-3 4.3-.6L10 3.5Z" />
                      </ActionIcon>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openReplacePicker(image.id)}
                    disabled={busy}
                    aria-label={`Replace image ${index + 1}`}
                    title="Replace"
                    className={iconButtonClasses}
                  >
                    <ActionIcon>
                      <path d="M4 8.5a6 6 0 0 1 10.5-2.2M16 5.5v2.8h-2.8" />
                      <path d="M16 11.5a6 6 0 0 1-10.5 2.2M4 14.5v-2.8h2.8" />
                    </ActionIcon>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(image)}
                    disabled={busy}
                    aria-label={`Delete image ${index + 1}`}
                    title="Delete"
                    className={cn(iconButtonClasses, "hover:bg-danger/10 hover:text-danger")}
                  >
                    <ActionIcon>
                      <path d="M4.5 6h11M8 6V4.75A.75.75 0 0 1 8.75 4h2.5a.75.75 0 0 1 .75.75V6m2 0-.6 9.13a1.5 1.5 0 0 1-1.5 1.37H8.1a1.5 1.5 0 0 1-1.5-1.37L6 6" />
                    </ActionIcon>
                  </button>
                </div>
              </div>
            </li>
          ))}

          {uploads.map((task) => (
            <li
              key={`upload-${task.key}`}
              className={cn(
                "relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border",
                task.error ? "border-danger/40" : "border-border"
              )}
            >
              {task.error ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center">
                  <p className="text-danger text-xs font-semibold">Upload failed</p>
                  <p className="text-muted line-clamp-3 text-xs leading-relaxed">{task.error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setUploads((tasks) => tasks.filter((item) => item.key !== task.key))
                    }
                  >
                    Dismiss
                  </Button>
                </div>
              ) : (
                <>
                  <Skeleton className="absolute inset-0 rounded-none" />
                  <div className="relative z-10 mt-auto flex flex-col gap-1.5 p-3">
                    <p className="truncate text-xs font-medium">{task.name}</p>
                    <div
                      role="progressbar"
                      aria-valuenow={task.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Uploading ${task.name}`}
                      className="bg-foreground/10 h-1 overflow-hidden rounded-full"
                    >
                      <div
                        className="bg-secondary h-full rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <p className="text-muted text-[11px]">{task.progress}%</p>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {hasLocalPlaceholders && (
        <p className="text-muted text-xs leading-relaxed">
          Some entries use the app&apos;s local placeholder imagery — deleting one only removes the
          gallery entry, the placeholder file stays available to other products.
        </p>
      )}

      <Modal
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        size="sm"
        title="Delete image"
        description="The image is removed from the gallery and from storage."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              isLoading={deleting}
              className="bg-danger hover:bg-danger/85"
            >
              Delete image
            </Button>
          </>
        }
      >
        <p className="text-muted text-sm leading-relaxed">
          This can&apos;t be undone. If it was the primary image, the next one takes its place.
        </p>
      </Modal>
    </Card>
  );
}
