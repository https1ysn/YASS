"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Product, ProductSpecification } from "@/types/product";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useCartStore } from "@/store/cart-store";
import { filterColors } from "@/constants/shop";
import { HeartIcon } from "@/components/layout/icons";
import { RatingStars } from "./rating-stars";
import { ColorSelector } from "./color-selector";
import { SizeSelector } from "./size-selector";
import { QuantitySelector } from "./quantity-selector";
import { ProductAccordions } from "./product-accordions";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export interface ProductInfoProps {
  product: Product;
  specifications: ProductSpecification[];
  shipping: string[];
  care: string[];
}

export function ProductInfo({ product, specifications, shipping, care }: ProductInfoProps) {
  const router = useRouter();
  const addLine = useCartStore((state) => state.addLine);
  const [color, setColor] = React.useState<string | null>(product.colors[0] ?? null);
  const [size, setSize] = React.useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null
  );
  const [quantity, setQuantity] = React.useState(1);
  const [saved, setSaved] = React.useState(false);

  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const inStock = product.availability === "in-stock";
  const swatches = filterColors.filter((c) => product.colors.includes(c.value));

  function requireSize(): boolean {
    if (size) return true;
    toast({ title: "Select a size first", variant: "warning" });
    return false;
  }

  function addToBag() {
    if (!requireSize()) return;
    addLine(product, { size: size!, color: color ?? product.colors[0] ?? "", quantity });
    toast({
      title: "Added to bag",
      description: `${quantity} × ${product.name} · Size ${size}`,
      variant: "success",
    });
  }

  function buyNow() {
    if (!requireSize()) return;
    addLine(product, { size: size!, color: color ?? product.colors[0] ?? "", quantity });
    router.push("/checkout");
  }

  function toggleWishlist() {
    setSaved((prev) => !prev);
    toast({
      title: saved ? "Removed from wishlist" : "Saved to wishlist",
      variant: saved ? "info" : "success",
    });
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: url, variant: "success" });
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <div className="animate-slide-up flex flex-col gap-6">
      {/* Title block */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/collections/${product.category.toLowerCase()}`}
          className="text-secondary hover:text-foreground w-fit text-xs font-medium tracking-[0.2em] uppercase transition-colors"
        >
          {product.category}
        </Link>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl">{product.name}</h1>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      {/* Price + stock */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-semibold tracking-tight">
            {formatPrice(product.price)}
          </span>
          {onSale && <s className="text-muted text-base">{formatPrice(product.compareAtPrice!)}</s>}
        </div>
        <p
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium",
            inStock ? "text-success" : "text-warning"
          )}
        >
          <span
            aria-hidden="true"
            className={cn("size-2 rounded-full", inStock ? "bg-success" : "bg-warning")}
          />
          {inStock ? "In stock — ships within 2–3 days" : "Made to order — 2–3 weeks"}
        </p>
      </div>

      <p className="text-muted text-base leading-relaxed">{product.description}</p>

      {/* Selectors */}
      <div className="border-border flex flex-col gap-6 border-t pt-6">
        {swatches.length > 0 && (
          <ColorSelector colors={swatches} value={color} onChange={setColor} />
        )}
        <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />
        <div className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">Quantity</p>
          <QuantitySelector value={quantity} onChange={setQuantity} className="self-start" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button size="lg" fullWidth onClick={addToBag}>
            Add to bag
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleWishlist}
            aria-pressed={saved}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            className={cn(
              "border-border h-13 w-13 shrink-0 rounded-2xl border",
              saved && "border-secondary text-secondary"
            )}
          >
            <HeartIcon className={cn(saved && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={share}
            aria-label="Share this piece"
            className="border-border h-13 w-13 shrink-0 rounded-2xl border"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <circle cx="5" cy="10" r="2.25" />
              <circle cx="14.5" cy="4.75" r="2.25" />
              <circle cx="14.5" cy="15.25" r="2.25" />
              <path d="m7 9 5.5-3.25M7 11l5.5 3.25" />
            </svg>
          </Button>
        </div>
        <Button variant="secondary" size="lg" fullWidth onClick={buyNow}>
          Buy now
        </Button>
      </div>

      <ProductAccordions specifications={specifications} shipping={shipping} care={care} />
    </div>
  );
}
