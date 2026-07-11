"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export interface ProductGalleryProps {
  images: string[];
  alt: string;
  badge?: string;
  className?: string;
}

/**
 * Main image with hover zoom (desktop) and a lightbox, plus a thumbnail rail.
 * UI only — images are static placeholders.
 */
export function ProductGallery({ images, alt, badge, className }: ProductGalleryProps) {
  const [active, setActive] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState("50% 50%");
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className={cn("animate-fade-in flex flex-col gap-3 sm:gap-4", className)}>
      <div
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={onMouseMove}
        className="group border-border bg-surface-elevated shadow-soft relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-2xl border"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ transformOrigin: origin }}
          className={cn(
            "ease-luxury object-cover transition-transform duration-500",
            zoomed && "lg:scale-[1.7]"
          )}
        />
        {badge && (
          <Badge variant="primary" className="absolute top-4 left-4 z-10">
            {badge}
          </Badge>
        )}
        <button
          type="button"
          aria-label="Open image in full view"
          onClick={(event) => {
            event.stopPropagation();
            setLightboxOpen(true);
          }}
          className="glass text-foreground focus-visible:ring-ring absolute right-4 bottom-4 z-10 grid size-11 place-items-center rounded-2xl transition-all hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="size-4.5"
          >
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13.2 13.2 3.3 3.3M9 6.75v4.5M6.75 9h4.5" />
          </svg>
        </button>
      </div>

      <div role="group" aria-label="Product images" className="flex gap-2.5 sm:gap-3">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            aria-label={`View image ${index + 1} of ${images.length}`}
            aria-current={active === index}
            onClick={() => setActive(index)}
            className={cn(
              "relative aspect-[4/5] w-full max-w-20 overflow-hidden rounded-xl border transition-all",
              "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              active === index
                ? "border-primary shadow-soft"
                : "border-border opacity-70 hover:opacity-100"
            )}
          >
            <Image src={image} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        size="lg"
        title={alt}
        className="max-w-3xl"
      >
        <div className="relative aspect-[4/5] max-h-[70dvh] w-full overflow-hidden rounded-2xl">
          <Image
            src={images[active]}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain"
          />
        </div>
      </Modal>
    </div>
  );
}
