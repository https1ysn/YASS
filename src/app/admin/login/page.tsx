import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/admin";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Sign in" };

export const dynamic = "force-dynamic";

/** Admin sign-in — rendered outside the dashboard shell. */
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4 sm:p-6">
      <div className="animate-slide-up flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-foreground flex items-baseline gap-2 text-xl font-bold tracking-[0.35em]">
            {siteConfig.wordmark}
            <span className="text-secondary text-[10px] font-medium tracking-[0.2em] uppercase">
              Admin
            </span>
          </p>
          <p className="text-muted text-sm leading-relaxed">
            Sign in to manage the maison.
          </p>
        </div>

        <Card className="flex flex-col gap-6 p-6 sm:p-8">
          <LoginForm />
        </Card>

        <Link
          href="/"
          className="text-muted hover:text-foreground self-center text-xs font-medium tracking-[0.15em] uppercase transition-colors"
        >
          Back to the store
        </Link>
      </div>
    </div>
  );
}
