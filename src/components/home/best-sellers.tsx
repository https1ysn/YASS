import * as React from "react";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/components/ui/product-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { bestSellers as defaultProducts, type PlaceholderProduct } from "@/constants/home";

export function BestSellers({
  products = defaultProducts,
}: {
  products?: readonly PlaceholderProduct[];
}) {
  return (
    <Section
      eyebrow="Most loved"
      title="Best sellers"
      description="The pieces our clients return for, season after season."
      align="center"
    >
      {/* Snap-scrolling row on mobile, grid from sm up */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {products.map((product, index) => (
          <Reveal
            key={product.href}
            delay={index * 80}
            className="w-[72%] shrink-0 snap-start sm:w-auto sm:shrink"
          >
            <ProductCard {...product} className="h-full" />
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10 flex justify-center sm:mt-14">
        <ButtonLink href="/shop" variant="outline">
          Shop all best sellers
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
