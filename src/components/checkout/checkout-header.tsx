import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Bag", href: "/cart" },
  { label: "Details" },
  { label: "Confirmation" },
] as const;

export interface CheckoutHeaderProps {
  title: string;
  /** 1-based index of the active step. */
  currentStep: 1 | 2 | 3;
  className?: string;
}

/** Page title with the Bag → Details → Confirmation step indicator. */
export function CheckoutHeader({ title, currentStep, className }: CheckoutHeaderProps) {
  return (
    <div className={cn("animate-slide-up flex flex-col gap-4", className)}>
      <nav aria-label="Checkout progress">
        <ol className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCurrent = stepNumber === currentStep;
            const isDone = stepNumber < currentStep;
            return (
              <li key={step.label} className="flex items-center gap-2">
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
                    className="text-muted/60 size-3"
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
