import * as React from "react";
import { cn } from "@/lib/utils";
import { Container, type ContainerProps } from "./container";

const spacings = {
  sm: "py-10 sm:py-14",
  md: "py-16 sm:py-24",
  lg: "py-24 sm:py-32",
} as const;

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: keyof typeof spacings;
  containerSize?: ContainerProps["size"];
  /** Small uppercase kicker above the title. */
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
}

export function Section({
  spacing = "md",
  containerSize = "lg",
  eyebrow,
  title,
  description,
  align = "left",
  className,
  children,
  ...props
}: SectionProps) {
  const hasHeader = eyebrow || title || description;

  return (
    <section className={cn(spacings[spacing], className)} {...props}>
      <Container size={containerSize}>
        {hasHeader && (
          <header
            className={cn(
              "mb-10 flex max-w-2xl flex-col gap-4 sm:mb-14",
              align === "center" && "mx-auto items-center text-center"
            )}
          >
            {eyebrow && (
              <p className="text-secondary text-xs font-medium tracking-[0.2em] uppercase">
                {eyebrow}
              </p>
            )}
            {title && <h2>{title}</h2>}
            {description && <p className="text-muted text-base leading-relaxed">{description}</p>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
