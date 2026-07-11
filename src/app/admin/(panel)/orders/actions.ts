"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/session";
import { isOrderStatus, type AdminOrderStatus } from "@/lib/order-status";

export type OrderStatusActionResult =
  | { ok: true; status: AdminOrderStatus }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

function friendlyError(message: string, code?: string): string {
  if (code === "PGRST202" || /admin_update_order_status/i.test(message)) {
    return "Orders management isn't fully set up yet — apply the latest database migration (20260710130000_admin_orders.sql) and try again.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONN|timeout/i.test(message)) {
    return "We couldn't reach the database. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/** Progresses an order along the lifecycle (or cancels it) via the admin RPC.
 * The RPC enforces the forward-only flow; this mirrors the validation. */
export async function updateOrderStatus(input: {
  id: string;
  status: string;
}): Promise<OrderStatusActionResult> {
  const denied = await requireAdminAction();
  if (denied) return { ok: false, error: denied };

  if (!UUID_RE.test(input.id)) {
    return { ok: false, error: "Invalid order id." };
  }
  if (!isOrderStatus(input.status)) {
    return { ok: false, error: "Invalid status." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_update_order_status", {
      p_id: input.id,
      p_status: input.status,
    });
    if (error) return { ok: false, error: friendlyError(error.message, error.code) };

    const status = (data as { status?: string } | null)?.status;
    if (!status || !isOrderStatus(status)) {
      return { ok: false, error: "The order could not be updated. Please try again." };
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${input.id}`);
    revalidatePath("/admin");
    return { ok: true, status };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}
