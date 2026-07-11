"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { signOutAdmin } from "@/app/admin/login/actions";

/** Ends the session and returns to the login page. */
export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function logout() {
    if (pending) return;
    setPending(true);
    const result = await signOutAdmin();
    if (!result.ok) {
      setPending(false);
      toast({ title: "Couldn't sign you out", description: result.error, variant: "danger" });
      return;
    }
    toast({ title: "Signed out", variant: "info" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className={cn(
        "group text-muted hover:text-danger flex items-center gap-2 text-sm font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-60",
        className
      )}
    >
      {pending ? (
        <Spinner size="sm" />
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        >
          <path d="M12.5 6.5v-2a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 4.5v11A1.5 1.5 0 0 0 5 17h6a1.5 1.5 0 0 0 1.5-1.5v-2" />
          <path d="M8 10h8.5m0 0-2.5-2.5M16.5 10 14 12.5" />
        </svg>
      )}
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
