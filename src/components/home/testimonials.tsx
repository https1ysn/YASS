import * as React from "react";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { testimonials } from "@/constants/home";

function Stars({ rating }: { rating: number }) {
  return (
    <div aria-label={`Rated ${rating} out of 5`} className="text-secondary flex gap-1">
      {Array.from({ length: rating }).map((_, i) => (
        <svg key={i} aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path d="m10 2.5 2.2 4.9 5.3.5-4 3.6 1.1 5.2L10 14l-4.6 2.7 1.1-5.2-4-3.6 5.3-.5L10 2.5Z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <Section
      eyebrow="Words from our clients"
      title="Quiet luxury, loudly loved"
      align="center"
      className="bg-surface/50"
    >
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal key={testimonial.name} delay={index * 100}>
            <Card className="flex h-full flex-col gap-5 p-6 sm:p-8">
              <Stars rating={testimonial.rating} />
              <blockquote className="text-foreground/85 flex-1 text-base leading-relaxed">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="border-border flex items-center gap-3 border-t pt-5">
                <span
                  aria-hidden="true"
                  className="bg-secondary/15 text-secondary grid size-10 place-items-center rounded-full text-sm font-semibold"
                >
                  {testimonial.name.charAt(0)}
                </span>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-muted text-xs">{testimonial.location}</p>
                </div>
              </figcaption>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
