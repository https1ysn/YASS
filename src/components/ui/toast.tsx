"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { StatusIcon, type StatusVariant } from "./alert";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: StatusVariant;
  /** Auto-dismiss delay in ms. Defaults to 4000. */
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, "title" | "variant" | "duration">> {
  id: number;
  description?: string;
}

interface ToastState {
  toasts: ToastItem[];
  add: (options: ToastOptions) => void;
  dismiss: (id: number) => void;
}

let nextId = 0;

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: ({ title, description, variant = "info", duration = 4000 }) =>
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { id: nextId++, title, description, variant, duration }],
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Imperative helper — call from anywhere on the client: toast({ title: "Added to cart" }) */
export function toast(options: ToastOptions) {
  useToastStore.getState().add(options);
}

function ToastCard({ item, dismissLabel }: { item: ToastItem; dismissLabel: string }) {
  const dismiss = useToastStore((s) => s.dismiss);

  React.useEffect(() => {
    const timer = setTimeout(() => dismiss(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, dismiss]);

  return (
    <div
      role="status"
      className={cn(
        "border-border pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4",
        "glass animate-slide-up shadow-elevated"
      )}
    >
      <span
        className={cn(
          item.variant === "success" && "text-success",
          item.variant === "warning" && "text-warning",
          item.variant === "danger" && "text-danger",
          item.variant === "info" && "text-secondary"
        )}
      >
        <StatusIcon variant={item.variant} />
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-foreground text-sm font-semibold tracking-wide">{item.title}</p>
        {item.description && (
          <p className="text-muted text-sm leading-relaxed">{item.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label={dismissLabel}
        className="text-muted hover:bg-foreground/5 hover:text-foreground -m-1 rounded-full p-1 transition-colors"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
          <path
            d="M5 5 15 15M15 5 5 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export interface ToasterProps {
  /** aria-label for each toast's dismiss button — override with a translated string outside admin. */
  dismissLabel?: string;
}

/** Mount once per root layout (storefront and admin each mount their own). */
export function Toaster({ dismissLabel = "Dismiss" }: ToasterProps = {}) {
  const toasts = useToastStore((s) => s.toasts);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-3 rtl:items-start sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96 rtl:sm:right-auto rtl:sm:left-6"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} dismissLabel={dismissLabel} />
      ))}
    </div>,
    document.body
  );
}
