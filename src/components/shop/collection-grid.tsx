"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/shared/reveal";
import { ArrowRightIcon } from "@/components/layout/icons";
import { Link } from "@/i18n/navigation";

export interface CollectionGridProps {
  collections: Collection[];
  className?: string;
}

export function CollectionGrid({ collections, className }: CollectionGridProps) {
  const t = useTranslations("shop");

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3", className)}>
      {collections.map((collection, index) => (
        <Reveal key={collection.slug} delay={index * 80}>
          <Link
            href={`/collections/${collection.slug}`}
            className="group hover-lift border-border shadow-soft focus-visible:ring-ring focus-visible:ring-offset-background relative block overflow-hidden rounded-2xl border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={collection.imageSrc}
                alt={collection.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="ease-luxury object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
              />
            </div>

            {collection.comingSoon && (
              <Badge variant="secondary" className="absolute top-4 start-4">
                {t("collectionGrid.comingSoon")}
              </Badge>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-medium tracking-[0.18em] uppercase opacity-75">
                  {collection.pieceCount > 0
                    ? t("piece", { count: collection.pieceCount })
                    : t("collectionGrid.arrivingSoon")}
                </p>
                <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {collection.name}
                </p>
                <p className="hidden text-sm text-white/80 sm:block">{collection.description}</p>
              </div>
              <ArrowRightIcon className="mb-1 size-5 shrink-0 rtl:-scale-x-100 opacity-80 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
