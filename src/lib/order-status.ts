/**
 * Order status lifecycle — client-safe (imported by admin client components;
 * the server-only read model in lib/supabase/admin re-exports it).
 */

/** Lifecycle order matters — statuses only move forward (or to cancelled). */
export const ORDER_STATUS_FLOW = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
] as const;

export const ORDER_STATUSES = [...ORDER_STATUS_FLOW, "cancelled"] as const;

export type AdminOrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is AdminOrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
