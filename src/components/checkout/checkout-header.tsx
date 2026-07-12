"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface CheckoutHeaderProps {
  title: string;
  /** 1-based index of the active step. */
  currentStep: 1 | 2 | 3;
  className?: string;
}

/** Page title with the Bag → Details → Confirmation step indicator. */
export function CheckoutHeader({ title, currentStep, className }: CheckoutHeaderProps) {
  const t = useTranslations("checkout.header");
  const steps = [
    { key: "bag", label: t("bag"), href: "/cart" },
    { key: "details", label: t("details") },
    { key: "confirmation", label: t("confirmation") },
  ] as const;

  return (
    <div className={cn("animate-slide-up flex flex-col gap-4", className)}>
      <nav aria-label={t("progressAria")}>
        <ol className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCurrent = stepNumber === currentStep;
            const isDone = stepNumber < currentStep;
            return (
              <li key={step.key} className="flex items-center gap-2">
                {"href" in step && step.href && !isCurrent ? (
                  <Link
                    href={step.href}
                    className="text-muted hover:text-foreground transition-colors"
                  >
                    {step.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      isCurrent ? "text-foreground" : isDone ? "text-secondary" : "text-muted"
                    )}
                  >
                    {step.label}
                  </span>
                )}
                {index < steps.length - 1 && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-muted/60 size-3 rtl:-scale-x-100"
                  >
                    <path
                      d="m7.5 5 5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl">{title}</h1>
    </div>
  );
}
