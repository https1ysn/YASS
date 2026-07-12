import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin — Yasso Store",
  },
  robots: { index: false, follow: false },
};

/**
 * Independent root layout for /admin — its own <html>/<body> (Next.js
 * "multiple root layouts" pattern), sitting outside the [locale] segment.
 * The admin stays English-only and is not part of the storefront's i18n.
 */
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground flex min-h-dvh flex-col font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
