import { redirect } from "next/navigation";
import { AdminSidebar, AdminTopbar } from "@/components/admin";
import { brandFromSettings } from "@/components/layout";
import { getAdminUser } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/settings";

/**
 * Admin shell — fixed sidebar on desktop, drawer via the topbar on mobile.
 * Server-side auth guard: the middleware redirects first for a flicker-free
 * experience, but the layout re-validates the session so pages are protected
 * even without it. Any authenticated Supabase user is an admin.
 */
export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  const brand = brandFromSettings(await getSiteSettings());

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <AdminSidebar brand={brand} />
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <AdminTopbar brand={brand} />
        <main id="admin-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
