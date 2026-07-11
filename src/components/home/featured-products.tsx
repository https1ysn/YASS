import * as React from "react";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/components/ui/product-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { featuredProducts as defaultProducts, type PlaceholderProduct } from "@/constants/home";

export function FeaturedProducts({
  products = defaultProducts,
}: {
  products?: readonly PlaceholderProduct[];
}) {
  return (
    <Section
      eyebrow="The edit"
      title="Featured pieces"
      description="A tight selection from the new season — chosen by our ateliers."
      className="bg-surface/50"
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((product, index) => (
          <Reveal key={product.href} delay={index * 80}>
            <ProductCard {...product} />
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10 flex justify-center sm:mt-14">
        <ButtonLink href="/collections/new" variant="outline">
          View all new arrivals
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
