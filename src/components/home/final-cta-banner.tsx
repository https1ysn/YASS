import * as React from "react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";

/** Full-width closing statement before the footer. */
export function FinalCtaBanner() {
  return (
    <section className="bg-primary text-primary-foreground py-20 sm:py-28">
      <Container size="md">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <p className="text-xs font-medium tracking-[0.25em] uppercase opacity-70">
            Yasso — Est. 1998
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Elevate the everyday
          </h2>
          <p className="max-w-xl text-base leading-relaxed opacity-80">
            Pieces that outlast seasons and trends — made slowly, worn often, kept forever.
          </p>
          <div className="mt-2 flex flex-col gap-3 self-stretch sm:flex-row sm:justify-center sm:self-auto">
            <ButtonLink href="/collections/new" variant="secondary" size="lg">
              Shop the new season
            </ButtonLink>
            <ButtonLink
              href="/collections"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary border bg-transparent shadow-none"
            >
              Browse all collections
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
