"use client";

import * as React from "react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function AnnouncementBar() {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <Container>
        <div className="relative flex h-9 items-center justify-center">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase">
            {siteConfig.announcement}
          </p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss announcement"
            className="absolute right-0 rounded-full p-1.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-3.5">
              <path
                d="M5 5 15 15M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </Container>
    </div>
  );
}
