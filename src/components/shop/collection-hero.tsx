import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

export interface CollectionHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** With an image the hero renders as a banner; without, as a text header. */
  imageSrc?: string;
  imageAlt?: string;
  count?: number;
  breadcrumb?: BreadcrumbItem[];
}

export function CollectionHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  count,
  breadcrumb,
}: CollectionHeroProps) {
  return (
    <section className="pt-6 sm:pt-8">
      <Container>
        {breadcrumb && <Breadcrumb items={breadcrumb} className="animate-fade-in mb-5 sm:mb-7" />}

        {imageSrc ? (
          <div className="animate-scale-in shadow-elevated relative overflow-hidden rounded-2xl">
            <div className="relative h-64 sm:h-80 lg:h-96">
              <Image
                src={imageSrc}
                alt={imageAlt ?? title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white sm:p-10">
              {eyebrow && (
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase opacity-80">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-3xl sm:text-5xl">{title}</h1>
              {description && (
                <p className="max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                  {description}
                </p>
              )}
              {count != null && (
                <p className="mt-1 text-xs font-medium tracking-[0.15em] text-white/70 uppercase">
                  {count} {count === 1 ? "piece" : "pieces"}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-slide-up flex max-w-2xl flex-col gap-4">
            {eyebrow && (
              <p className="text-secondary text-xs font-medium tracking-[0.2em] uppercase">
                {eyebrow}
              </p>
            )}
            <h1>{title}</h1>
            {description && (
              <p className="text-muted text-base leading-relaxed sm:text-lg">{description}</p>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
