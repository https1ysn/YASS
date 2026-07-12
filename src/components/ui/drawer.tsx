"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useOverlay } from "@/hooks/use-overlay";

const sides = {
  right: "inset-y-0 right-0 h-full w-full max-w-md animate-slide-in-right rounded-l-2xl",
  left: "inset-y-0 left-0 h-full w-full max-w-md animate-slide-in-left rounded-r-2xl",
  bottom: "inset-x-0 bottom-0 max-h-[85dvh] w-full animate-slide-in-bottom rounded-t-2xl",
} as const;

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: keyof typeof sides;
  title?: string;
  /** Slot pinned to the bottom of the panel — e.g. a checkout button. */
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** aria-label for the close button — override with a translated string outside admin. */
  closeLabel?: string;
}

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  footer,
  children,
  className,
  closeLabel = "Close",
}: DrawerProps) {
  const { panelRef, mounted } = useOverlay(open, onClose);
  const titleId = React.useId();

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="animate-fade-in bg-overlay absolute inset-0 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "border-border bg-surface-elevated shadow-lift absolute flex flex-col border focus:outline-none",
          sides[side],
          className
        )}
      >
        <div className="border-border flex items-center justify-between gap-4 border-b p-6">
          {title ? (
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="text-muted hover:bg-foreground/5 hover:text-foreground -m-2 rounded-full p-2 transition-colors"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5">
              <path
                d="M5 5 15 15M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="border-border border-t p-6">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
