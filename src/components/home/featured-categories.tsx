import * as React from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/shared/reveal";
import { Link } from "@/i18n/navigation";
import { featuredCategories as defaultCategories } from "@/constants/home";

export interface FeaturedCategoryItem {
  name: string;
  href: string;
  imageSrc: string;
  description: string;
}

export async function FeaturedCategories({
  categories = defaultCategories,
}: {
  categories?: readonly FeaturedCategoryItem[];
}) {
  const t = await getTranslations("home.featuredCategories");

  return (
    <Section eyebrow={t("eyebrow")} title={t("title")} description={t("description")}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {categories.map((category, index) => (
          <Reveal key={category.name} delay={index * 80}>
            <Link
              href={category.href}
              className="group hover-lift border-border shadow-soft focus-visible:ring-ring focus-visible:ring-offset-background relative block overflow-hidden rounded-2xl border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={category.imageSrc}
                  alt={category.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="ease-luxury object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4 text-white sm:p-6">
                <p className="text-lg font-semibold tracking-tight sm:text-xl">{category.name}</p>
                <p className="hidden text-xs text-white/80 sm:block">{category.description}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
