import * as React from "react";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { benefits } from "@/constants/home";

const icons: Record<(typeof benefits)[number]["icon"], React.ReactNode> = {
  shipping: (
    <>
      <path d="M2.75 5.75h9.5v8.5h-9.5z" />
      <path d="M12.25 8.25h2.9l2.1 2.6v3.4h-5" />
      <circle cx="5.75" cy="15.25" r="1.5" />
      <circle cx="14.25" cy="15.25" r="1.5" />
    </>
  ),
  returns: (
    <>
      <path d="M4 8.5a6 6 0 1 1-.9 4.3" />
      <path d="M4 4.5v4h4" />
    </>
  ),
  craft: (
    <>
      <path d="m10 3 1.7 4.3L16 9l-4.3 1.7L10 15l-1.7-4.3L4 9l4.3-1.7L10 3Z" />
      <path d="m15.5 13.5.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
    </>
  ),
  care: (
    <>
      <path d="M10 17.25 4.3 11.5a3.75 3.75 0 0 1 5.3-5.3l.4.4.4-.4a3.75 3.75 0 0 1 5.3 5.3L10 17.25Z" />
    </>
  ),
};

export function Benefits() {
  return (
    <Section spacing="sm" aria-label="Why shop with us">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <Reveal key={benefit.title} delay={index * 80}>
            <Card className="flex h-full flex-col gap-4 p-6 sm:p-8">
              <span className="bg-secondary/15 text-secondary grid size-12 place-items-center rounded-2xl">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5.5"
                >
                  {icons[benefit.icon]}
                </svg>
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold tracking-normal sm:text-lg">
                  {benefit.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
