"use client";

import { useTranslations } from "next-intl";
import type { ProductSpecification } from "@/types/product";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

export interface ProductAccordionsProps {
  specifications: ProductSpecification[];
  shipping: string[];
  care: string[];
}

/** Specifications, Shipping & Returns and Care — native, accessible accordions. */
export function ProductAccordions({ specifications, shipping, care }: ProductAccordionsProps) {
  const t = useTranslations("product.accordions");

  return (
    <Accordion>
      <AccordionItem title={t("specifications")} defaultOpen>
        <dl className="flex flex-col gap-2.5">
          {specifications.map((spec) => (
            <div key={spec.label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="text-muted">{spec.label}</dt>
              <dd className="text-foreground text-right font-medium">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </AccordionItem>

      <AccordionItem title={t("shippingReturns")}>
        <ul className="flex flex-col gap-2.5">
          {shipping.map((line) => (
            <li key={line} className="text-muted flex gap-2.5 text-sm leading-relaxed">
              <span aria-hidden="true" className="bg-secondary mt-2 size-1 shrink-0 rounded-full" />
              {line}
            </li>
          ))}
        </ul>
      </AccordionItem>

      <AccordionItem title={t("careInstructions")}>
        <ul className="flex flex-col gap-2.5">
          {care.map((line) => (
            <li key={line} className="text-muted flex gap-2.5 text-sm leading-relaxed">
              <span aria-hidden="true" className="bg-secondary mt-2 size-1 shrink-0 rounded-full" />
              {line}
            </li>
          ))}
        </ul>
      </AccordionItem>
    </Accordion>
  );
}
