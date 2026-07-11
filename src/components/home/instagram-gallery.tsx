import * as React from "react";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/shared/reveal";
import { instagramHandle, instagramPosts } from "@/constants/home";

export function InstagramGallery() {
  return (
    <Section
      eyebrow="Follow the maison"
      title={instagramHandle}
      description="Ateliers, campaigns and quiet moments — from our studio to yours."
      align="center"
      spacing="sm"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {instagramPosts.map((post, index) => (
          <Reveal key={post.imageSrc} delay={index * 60}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${post.alt} — opens Instagram`}
              className="group border-border shadow-soft focus-visible:ring-ring focus-visible:ring-offset-background relative block aspect-square overflow-hidden rounded-2xl border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Image
                src={post.imageSrc}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                className="ease-luxury object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100">
                <span className="text-xs font-medium tracking-[0.15em] text-white uppercase">
                  {instagramHandle}
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
