import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/admin";
import { getSessionUser } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Unauthorized" };

export const dynamic = "force-dynamic";

/** Friendly stop for authenticated accounts that are not on the admin list. */
export default async function UnauthorizedPage() {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4 sm:p-6">
      <div className="animate-slide-up flex w-full max-w-md flex-col gap-6">
        <p className="text-foreground flex items-baseline justify-center gap-2 text-xl font-bold tracking-[0.35em]">
          {siteConfig.wordmark}
          <span className="text-secondary text-[10px] font-medium tracking-[0.2em] uppercase">
            Admin
          </span>
        </p>

        <Card className="flex flex-col gap-5 p-6 sm:p-8">
          <Alert variant="warning" title="Unauthorized">
            {user ? (
              <>
                You&apos;re signed in as <span className="font-semibold">{user.email}</span>, but
                this account has no access to the admin.
              </>
            ) : (
              "This account has no access to the admin."
            )}
          </Alert>
          <p className="text-muted text-sm leading-relaxed">
            If you believe this is a mistake, ask the maison to add your email to the admin list.
          </p>
          <div className="flex items-center justify-between gap-4">
            <LogoutButton />
            <Link
              href="/"
              className="text-muted hover:text-foreground text-xs font-medium tracking-[0.15em] uppercase transition-colors"
            >
              Back to the store
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
