import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin — Yasso Store",
  },
  robots: { index: false, follow: false },
};

/**
 * Root admin segment — metadata only. The dashboard shell (and its server-side
 * auth guard) lives in the (panel) group so /admin/login and /admin/unauthorized
 * render outside it.
 */
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
