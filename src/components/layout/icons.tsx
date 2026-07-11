import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared styling for icon-only header actions (used by both buttons and links). */
export const iconActionClasses = cn(
  "relative inline-flex size-11 items-center justify-center rounded-2xl text-foreground transition-all select-none",
  "hover:bg-foreground/5 active:scale-[0.98]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
);

type IconProps = React.SVGAttributes<SVGSVGElement>;

function Icon({ className, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.2 13.2 3.3 3.3" />
    </Icon>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 16.5S3.75 12.8 3.75 8.4a3.4 3.4 0 0 1 6.25-1.87A3.4 3.4 0 0 1 16.25 8.4c0 4.4-6.25 8.1-6.25 8.1Z" />
    </Icon>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.3 7h9.4l-.66 8.13a1.75 1.75 0 0 1-1.74 1.62H7.7a1.75 1.75 0 0 1-1.74-1.62L5.3 7Z" />
      <path d="M7.5 7V5.75a2.5 2.5 0 0 1 5 0V7" />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10" cy="6.75" r="3" />
      <path d="M4.75 16.25a5.25 5.25 0 0 1 10.5 0" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 7.5 5 5 5-5" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10h12m-5-5 5 5-5 5" />
    </Icon>
  );
}
