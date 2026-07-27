import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/layout/icons";

export type AccordionProps = React.HTMLAttributes<HTMLDivElement>;

/** Groups AccordionItems with dividing borders — used for specs/FAQ-style lists. */
export function Accordion({ className, ...props }: AccordionProps) {
  return <div className={cn("divide-border border-border divide-y border-y", className)} {...props} />;
}

export interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Native, keyboard- and screen-reader-accessible disclosure widget. */
export function AccordionItem({ title, defaultOpen = false, children }: AccordionItemProps) {
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
