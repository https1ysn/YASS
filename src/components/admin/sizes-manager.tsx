"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import type { AdminSize } from "@/schemas/admin-size";
import { deleteSize, reorderSizes, saveSize } from "@/app/admin/(panel)/sizes/actions";

/* ------------------------------------------------------------------- icons */

function Icon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      {children}
    </svg>
  );
}

const iconButtonClasses =
  "text-muted grid size-9 shrink-0 place-items-center rounded-xl transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40";

/* -------------------------------------------------------------------- row */

interface SizeRowProps {
  size: AdminSize;
  index: number;
  total: number;
  busy: boolean;
  dragging: boolean;
  dropTarget: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onMove: (direction: -1 | 1) => void;
  onRename: (name: string) => Promise<boolean>;
  onToggleActive: () => void;
  onDelete: () => void;
}

function SizeRow({
  size,
  index,
  total,
  busy,
  dragging,
  dropTarget,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onMove,
  onRename,
  onToggleActive,
  onDelete,
}: SizeRowProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(size.name);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => setDraft(size.name), [size.name]);

  async function commit() {
    const next = draft.trim();
    if (!next || next === size.name) {
      setEditing(false);
      setDraft(size.name);
      return;
    }
    setSaving(true);
    const ok = await onRename(next);
    setSaving(false);
    if (ok) setEditing(false);
    else setDraft(size.name);
  }

  return (
    <li
      draggable={!editing && !busy}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragEnd={onDragEnd}
      onDrop={(event) => {
        event.preventDefault();
        onDragEnd();
      }}
      className={cn(
        "border-border bg-surface-elevated flex items-center gap-2 rounded-xl border p-2.5 transition-all sm:gap-3",
        dragging && "opacity-40",
        dropTarget && "border-secondary ring-secondary/25 ring-2",
        !size.active && "opacity-70"
      )}
    >
      <span
        aria-hidden="true"
        title="Drag to reorder"
        className={cn(
          "text-muted grid size-8 shrink-0 cursor-grab place-items-center rounded-lg active:cursor-grabbing",
          (editing || busy) && "cursor-not-allowed opacity-40"
        )}
      >
        <Icon>
          <path d="M7 5h.01M7 10h.01M7 15h.01M13 5h.01M13 10h.01M13 15h.01" strokeWidth="2.5" />
        </Icon>
      </span>

      {editing ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void commit();
              }
              if (event.key === "Escape") {
                setEditing(false);
                setDraft(size.name);
              }
            }}
            aria-label={`Rename ${size.name}`}
            className="h-9 max-w-40 uppercase"
          />
          <Button type="button" size="sm" onClick={commit} isLoading={saving}>
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(false);
              setDraft(size.name);
            }}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-wide uppercase">
            {size.name}
          </span>
          <Badge
            variant={size.active ? "success" : "muted"}
            className="hidden px-2.5 py-0.5 text-[10px] sm:inline-flex"
          >
            {size.active ? "Active" : "Hidden"}
          </Badge>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={index === 0 || busy}
              aria-label={`Move ${size.name} up`}
              className={iconButtonClasses}
            >
              <Icon>
                <path d="M10 15.5v-11M5.5 9 10 4.5 14.5 9" />
              </Icon>
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={index === total - 1 || busy}
              aria-label={`Move ${size.name} down`}
              className={iconButtonClasses}
            >
              <Icon>
                <path d="M10 4.5v11M5.5 11 10 15.5 14.5 11" />
              </Icon>
            </button>
            <button
              type="button"
              onClick={onToggleActive}
              disabled={busy}
              aria-label={
                size.active ? `Hide ${size.name} from products` : `Show ${size.name} on products`
              }
              className={iconButtonClasses}
            >
              {size.active ? (
                <Icon>
                  <path d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10 14.5 15.5 10 15.5 2.5 10 2.5 10Z" />
                  <circle cx="10" cy="10" r="2.25" />
                </Icon>
              ) : (
                <Icon>
                  <path d="M4 4l12 12M8.2 8.3A2.25 2.25 0 0 0 10 12.25M6.1 6.2C3.9 7.6 2.5 10 2.5 10s3 5.5 7.5 5.5c1.3 0 2.5-.5 3.5-1.1M11.6 5c-.5-.3-1-.4-1.6-.4C5.5 4.6 2.5 10 2.5 10" />
                </Icon>
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={busy}
              aria-label={`Rename ${size.name}`}
              className={iconButtonClasses}
            >
              <Icon>
                <path d="M13.5 3.7a1.7 1.7 0 0 1 2.4 2.4L7.6 14.4l-3.2.8.8-3.2 8.3-8.3Z" />
              </Icon>
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              aria-label={`Delete ${size.name}`}
              className={cn(iconButtonClasses, "hover:bg-danger/10 hover:text-danger")}
            >
              <Icon>
                <path d="M4.5 6h11M8 6V4.75A1.25 1.25 0 0 1 9.25 3.5h1.5A1.25 1.25 0 0 1 12 4.75V6M6.5 6l.6 9a1.5 1.5 0 0 0 1.5 1.4h2.8a1.5 1.5 0 0 0 1.5-1.4l.6-9" />
              </Icon>
            </button>
          </div>
        </>
      )}
    </li>
  );
}

/* ----------------------------------------------------------------- manager */

export interface SizesManagerProps {
  sizes: AdminSize[];
}

/**
 * The Sizes dashboard — create, rename, show/hide, reorder (drag-and-drop with
 * keyboard-accessible move buttons) and delete. Ordering is applied optimistically
 * and persisted in one RPC call; a failure re-syncs from the server.
 */
export function SizesManager({ sizes }: SizesManagerProps) {
  const router = useRouter();
  const [items, setItems] = React.useState(sizes);
  const [busy, setBusy] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<AdminSize | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const dragIndex = React.useRef<number | null>(null);
  const [dragging, setDragging] = React.useState<number | null>(null);
  const [dropTarget, setDropTarget] = React.useState<number | null>(null);

  // The server list wins whenever it changes (after any router.refresh()).
  React.useEffect(() => setItems(sizes), [sizes]);

  async function persistOrder(next: AdminSize[]) {
    const previous = items;
    setItems(next);
    setBusy(true);
    const result = await reorderSizes(next.map((size) => size.id));
    setBusy(false);
    if (!result.ok) {
      setItems(previous);
      toast({ title: "Couldn't reorder sizes", description: result.error, variant: "danger" });
      return;
    }
    router.refresh();
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    void persistOrder(next);
  }

  function handleDragEnd() {
    const from = dragIndex.current;
    const to = dropTarget;
    dragIndex.current = null;
    setDragging(null);
    setDropTarget(null);
    if (from == null || to == null || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void persistOrder(next);
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name || creating) return;

    setCreating(true);
    const result = await saveSize({
      name,
      // New sizes land at the end of the list.
      sortOrder: items.length > 0 ? Math.max(...items.map((s) => s.sortOrder)) + 1 : 1,
      active: true,
    });
    setCreating(false);

    if (!result.ok) {
      toast({ title: "Couldn't add the size", description: result.error, variant: "danger" });
      return;
    }
    setNewName("");
    toast({ title: "Size added", description: name.toUpperCase(), variant: "success" });
    router.refresh();
  }

  async function rename(size: AdminSize, name: string): Promise<boolean> {
    const result = await saveSize({
      id: size.id,
      name,
      sortOrder: size.sortOrder,
      active: size.active,
    });
    if (!result.ok) {
      toast({ title: "Couldn't rename the size", description: result.error, variant: "danger" });
      return false;
    }
    toast({ title: "Size renamed", description: name.toUpperCase(), variant: "success" });
    router.refresh();
    return true;
  }

  async function toggleActive(size: AdminSize) {
    const next = items.map((item) =>
      item.id === size.id ? { ...item, active: !item.active } : item
    );
    setItems(next);
    setBusy(true);
    const result = await saveSize({
      id: size.id,
      name: size.name,
      sortOrder: size.sortOrder,
      active: !size.active,
    });
    setBusy(false);
    if (!result.ok) {
      setItems(items);
      toast({ title: "Couldn't update the size", description: result.error, variant: "danger" });
      return;
    }
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const result = await deleteSize(pendingDelete.id);
    setDeleting(false);
    if (!result.ok) {
      toast({ title: "Couldn't delete the size", description: result.error, variant: "danger" });
      return;
    }
    toast({
      title: "Size deleted",
      description:
        result.productsUsing > 0
          ? `${pendingDelete.name.toUpperCase()} — ${result.productsUsing} product${result.productsUsing === 1 ? "" : "s"} still list it.`
          : pendingDelete.name.toUpperCase(),
      variant: "success",
    });
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <Card className="animate-fade-in flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">Add a size</h2>
          <p className="text-muted text-sm leading-relaxed">
            Sizes appear as checkboxes on every product form, in the order below.
          </p>
        </div>
        <form onSubmit={create} className="flex flex-wrap items-end gap-3">
          <div className="min-w-40 flex-1">
            <Input
              label="Size name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="e.g. XXL or 42"
              className="uppercase"
            />
          </div>
          <Button type="submit" isLoading={creating} disabled={!newName.trim()}>
            Add size
          </Button>
        </form>
      </Card>

      <Card className="animate-fade-in flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">
            Size list
            {items.length > 0 && <span className="text-muted font-normal"> · {items.length}</span>}
          </h2>
          <p className="text-muted text-xs leading-relaxed">
            Drag to reorder, or use the arrow buttons.
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="No sizes yet"
            description="Add your first size above — it will be offered on every product form."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((size, index) => (
              <SizeRow
                key={size.id}
                size={size}
                index={index}
                total={items.length}
                busy={busy}
                dragging={dragging === index}
                dropTarget={dropTarget === index && dragging !== index}
                onDragStart={() => {
                  dragIndex.current = index;
                  setDragging(index);
                }}
                onDragEnter={() => setDropTarget(index)}
                onDragEnd={handleDragEnd}
                onMove={(direction) => move(index, direction)}
                onRename={(name) => rename(size, name)}
                onToggleActive={() => void toggleActive(size)}
                onDelete={() => setPendingDelete(size)}
              />
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={pendingDelete !== null}
        onClose={() => !deleting && setPendingDelete(null)}
        size="sm"
        title="Delete size"
        description={
          pendingDelete ? `"${pendingDelete.name}" will no longer be offered on products.` : ""
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              isLoading={deleting}
              className="bg-danger hover:bg-danger/85"
            >
              Delete size
            </Button>
          </>
        }
      >
        <p className="text-muted text-sm leading-relaxed">
          Products that already list this size keep it — it just stops appearing as an option on
          the product form. To hide a size without deleting it, use the eye button instead.
        </p>
      </Modal>
    </div>
  );
}
