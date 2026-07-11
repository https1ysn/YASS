"use client";

import * as React from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** Route-level error boundary for the admin area. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-10">
      <Alert variant="danger" title="Something went wrong">
        The dashboard hit an unexpected error. Try again — if it persists, check the server logs.
      </Alert>
      <Button variant="outline" onClick={reset} className="self-start">
        Try again
      </Button>
    </div>
  );
}
