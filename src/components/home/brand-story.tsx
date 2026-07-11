import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { brandStats } from "@/constants/home";

export function BrandStory() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="shadow-elevated relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src="/images/story/atelier.jpg"
                alt="Inside the Yasso atelier"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={120} className="flex flex-col items-start gap-6">
            <p className="text-secondary text-xs font-medium tracking-[0.2em] uppercase">
              The maison
            </p>
            <h2>Made slowly, kept forever</h2>
            <p className="text-muted text-base leading-relaxed">
              Since 1998 we have worked with a small circle of family ateliers, choosing certified
              silk, cashmere and vegetable-tanned leather over volume. Each piece passes through
              hands, not lines — and is designed to be repaired, not replaced.
            </p>
            <dl className="border-border grid w-full grid-cols-3 gap-6 border-y py-6">
              {brandStats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <dt className="text-muted order-2 text-xs leading-snug">{stat.label}</dt>
                  <dd className="order-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
            <ButtonLink href="/collections" variant="outline">
              Discover our story
            </ButtonLink>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
