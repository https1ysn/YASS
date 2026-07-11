import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section aria-label="Featured campaign" className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <Badge variant="outline" className="animate-slide-up">
              Autumn — Winter 2026
            </Badge>
            <h1 className="animate-slide-up [animation-delay:100ms]">The art of quiet luxury</h1>
            <p className="animate-slide-up text-muted text-base leading-relaxed [animation-delay:200ms] sm:text-lg">
              Considered silhouettes in warm neutral tones — cut from certified silk, cashmere and
              leather, finished by hand in our ateliers.
            </p>
            <div className="animate-slide-up flex flex-col gap-3 self-stretch [animation-delay:300ms] sm:flex-row sm:self-auto">
              <ButtonLink href="/shop" size="lg">
                Shop New Arrivals
              </ButtonLink>
              <ButtonLink href="/collections" variant="outline" size="lg">
                Explore Collections
              </ButtonLink>
            </div>
          </div>

          <div className="animate-scale-in relative [animation-delay:150ms]">
            <div className="shadow-lift relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/hero/hero.jpg"
                alt="Autumn–Winter 2026 campaign — warm neutral silhouettes"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="glass shadow-elevated absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl px-5 py-3.5 sm:bottom-6 sm:left-6">
              <span className="bg-secondary size-2 rounded-full" aria-hidden="true" />
              <div className="flex flex-col">
                <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">
                  Just landed
                </p>
                <p className="text-foreground text-sm font-semibold">The Autumn Capsule</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
