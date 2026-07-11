import * as React from "react";
import Link from "next/link";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button";

export interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rightIcon?: React.ReactNode;
}

/** A Next.js link styled exactly like a Button — for navigation CTAs. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  rightIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, fullWidth, className)} {...props}>
      {children}
      {rightIcon}
    </Link>
  );
}
