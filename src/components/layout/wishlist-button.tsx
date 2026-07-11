"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeartIcon, iconActionClasses } from "./icons";

export interface WishlistButtonProps {
  /** Number of saved items — wired up once the wishlist store exists. */
  count?: number;
  className?: string;
}

export function WishlistButton({ count = 0, className }: WishlistButtonProps) {
  return (
    <Link
      href="/wishlist"
      aria-label={count > 0 ? `Wishlist, ${count} items` : "Wishlist"}
      className={cn(iconActionClasses, className)}
    >
      <HeartIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="bg-secondary text-secondary-foreground absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full text-[10px] font-semibold"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
