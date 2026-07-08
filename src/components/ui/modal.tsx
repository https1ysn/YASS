"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useOverlay } from "@/hooks/use-overlay";

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: keyof typeof sizes;
  /** Slot pinned below the content — typically action buttons. */
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
  className,
}: ModalProps) {
  const { panelRef, mounted } = useOverlay(open, onClose);
  const titleId = React.useId();
  const descriptionId = React.useId();

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6">
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
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "animate-scale-in border-border bg-surface-elevated shadow-lift relative w-full rounded-2xl border focus:outline-none",
          sizes[size],
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-0 sm:p-8 sm:pb-0">
          <div className="flex flex-col gap-1.5">
            {title && (
              <h2 id={titleId} className="text-xl font-semibold tracking-tight sm:text-2xl">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="text-muted text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:bg-foreground/5 hover:text-foreground -m-2 rounded-full p-2 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 sm:p-8">{children}</div>
        {footer && (
          <div className="border-border flex items-center justify-end gap-3 border-t p-6 sm:px-8">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="M5 5 15 15M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
