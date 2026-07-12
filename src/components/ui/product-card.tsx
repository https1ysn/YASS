import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export interface ProductCardProps {
  name: string;
  href: string;
  imageSrc: string;
  imageAlt?: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  locale?: string;
  category?: string;
  badge?: string;
  /** "Sale" badge text — override with a translated string outside admin. */
  saleLabel?: string;
  /** Slot rendered below the details — e.g. an add-to-cart button. */
  footer?: React.ReactNode;
  className?: string;
}

function formatPrice(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export function ProductCard({
  name,
  href,
  imageSrc,
  imageAlt,
  price,
  compareAtPrice,
  currency = "USD",
  locale = "en-US",
  category,
  badge,
  saleLabel = "Sale",
  footer,
  className,
}: ProductCardProps) {
  const onSale = compareAtPrice != null && compareAtPrice > price;

  return (
    <article
      className={cn(
        "group hover-lift border-border bg-surface shadow-soft overflow-hidden rounded-2xl border",
        className
      )}
    >
      <Link href={href} className="block focus-visible:outline-none" aria-label={name}>
        <div className="bg-surface-elevated relative aspect-[4/5] overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt ?? name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="ease-luxury object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {(badge || onSale) && (
            <div className="absolute top-4 left-4 flex gap-2">
              {badge && <Badge variant="primary">{badge}</Badge>}
              {onSale && <Badge variant="secondary">{saleLabel}</Badge>}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 p-5 sm:p-6">
          {category && (
            <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">{category}</p>
          )}
          <h3 className="text-foreground text-base font-medium tracking-normal sm:text-lg">
            {name}
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-foreground text-base font-semibold">
              {formatPrice(price, currency, locale)}
            </span>
            {onSale && (
              <s className="text-muted text-sm">{formatPrice(compareAtPrice, currency, locale)}</s>
            )}
          </div>
        </div>
      </Link>
      {footer && <div className="px-5 pb-5 sm:px-6 sm:pb-6">{footer}</div>}
    </article>
  );
}
