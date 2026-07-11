import * as React from "react";
import { Card } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}

/** Compact KPI card for the dashboard overview. */
export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card className="animate-fade-in flex items-start justify-between gap-3 p-5 sm:p-6">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">{label}</p>
        <p className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
        {hint && <p className="text-muted text-xs">{hint}</p>}
      </div>
      {icon && (
        <span
          aria-hidden="true"
          className="bg-secondary/15 text-secondary grid size-10 shrink-0 place-items-center rounded-2xl"
        >
          {icon}
        </span>
      )}
    </Card>
  );
}
