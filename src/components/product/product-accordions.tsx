import * as React from "react";
import type { ProductSpecification } from "@/types/product";
import { ChevronDownIcon } from "@/components/layout/icons";

function AccordionItem({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium tracking-wide select-none [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDownIcon className="text-muted size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="animate-fade-in pb-5">{children}</div>
    </details>
  );
}

export interface ProductAccordionsProps {
  specifications: ProductSpecification[];
  shipping: string[];
  care: string[];
}

/** Specifications, Shipping & Returns and Care — native, accessible accordions. */
export function ProductAccordions({ specifications, shipping, care }: ProductAccordionsProps) {
  return (
    <div className="divide-border border-border divide-y border-y">
      <AccordionItem title="Specifications" defaultOpen>
        <dl className="flex flex-col gap-2.5">
          {specifications.map((spec) => (
            <div key={spec.label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="text-muted">{spec.label}</dt>
              <dd className="text-foreground text-right font-medium">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </AccordionItem>

      <AccordionItem title="Shipping & Returns">
        <ul className="flex flex-col gap-2.5">
          {shipping.map((line) => (
            <li key={line} className="text-muted flex gap-2.5 text-sm leading-relaxed">
              <span aria-hidden="true" className="bg-secondary mt-2 size-1 shrink-0 rounded-full" />
              {line}
            </li>
          ))}
        </ul>
      </AccordionItem>

      <AccordionItem title="Care Instructions">
        <ul className="flex flex-col gap-2.5">
          {care.map((line) => (
            <li key={line} className="text-muted flex gap-2.5 text-sm leading-relaxed">
              <span aria-hidden="true" className="bg-secondary mt-2 size-1 shrink-0 rounded-full" />
              {line}
            </li>
          ))}
        </ul>
      </AccordionItem>
    </div>
  );
}
