import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DEFAULT_WEBSITE_NAME, type SiteSettings } from "@/schemas/admin-settings";

/**
 * The brand identity as every surface consumes it — the storefront header and
 * footer, the admin shell and the sign-in screen. Kept to the two fields the
 * mark actually needs so client components can receive it as a plain prop
 * without dragging the whole settings blob across the server boundary.
 */
export interface BrandIdentity {
  name: string;
  logoUrl: string | null;
}

/** Narrows the settings blob (or its absence) down to the brand identity. */
export function brandFromSettings(settings?: SiteSettings | null): BrandIdentity {
  return {
    name: settings?.branding.websiteName?.trim() || DEFAULT_WEBSITE_NAME,
    logoUrl: settings?.branding.logoUrl ?? null,
  };
}

export interface BrandMarkProps extends BrandIdentity {
  /** Classes for the text wordmark rendered when no logo is set. */
  className?: string;
  /** Classes for the logo image rendered when one is set. */
  imageClassName?: string;
  /** Set on the header mark so the logo is not lazy-loaded above the fold. */
  priority?: boolean;
}

/**
 * Renders the uploaded logo when the admin has set one, and the website name
 * as a letter-spaced wordmark otherwise. Purely presentational — no hooks — so
 * it renders inside both server and client components.
 */
export function BrandMark({
  name,
  logoUrl,
  className,
  imageClassName,
  priority,
}: BrandMarkProps) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={240}
        height={60}
        priority={priority}
        className={cn("h-8 w-auto object-contain sm:h-9", imageClassName)}
      />
    );
  }

  return (
    <span
      className={cn(
        "truncate text-lg font-bold tracking-[0.18em] uppercase sm:text-xl",
        className
      )}
    >
      {name}
    </span>
  );
}
