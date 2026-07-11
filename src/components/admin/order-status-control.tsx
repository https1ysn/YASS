"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { ORDER_STATUS_FLOW, type AdminOrderStatus } from "@/lib/order-status";
import { updateOrderStatus } from "@/app/admin/(panel)/orders/actions";
import { OrderStatusBadge } from "./order-status-badge";

/** Statuses only move forward along the flow; cancellation is possible from
 * any non-terminal status. Delivered and cancelled are terminal. */
function nextStatuses(current: string): AdminOrderStatus[] {
  if (current === "delivered" || current === "cancelled") return [];
  const index = (ORDER_STATUS_FLOW as readonly string[]).indexOf(current);
  const forward = index >= 0 ? ORDER_STATUS_FLOW.slice(index + 1) : [];
  return [...forward, "cancelled"];
}

function label(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Status card on the order details page — dropdown + confirmation modal. */
export function OrderStatusControl({
  orderId,
  orderNumber,
  status: initialStatus,
}: {
  orderId: string;
  orderNumber: string;
  status: string;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState(initialStatus);
  const [selected, setSelected] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => setStatus(initialStatus), [initialStatus]);

  const options = nextStatuses(status);
  const terminal = options.length === 0;

  async function confirmUpdate() {
    if (!selected) return;
    setUpdating(true);
    const result = await updateOrderStatus({ id: orderId, status: selected });
    setUpdating(false);

    if (!result.ok) {
      toast({ title: "Couldn't update the order", description: result.error, variant: "danger" });
      return;
    }

    setStatus(result.status);
    setSelected("");
    setConfirmOpen(false);
    toast({
      title: result.status === "cancelled" ? "Order cancelled" : `Order marked ${result.status}`,
      description: orderNumber,
      variant: result.status === "cancelled" ? "info" : "success",
    });
    router.refresh();
  }

  return (
    <Card className="animate-fade-in flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">Status</h2>
        <OrderStatusBadge status={status} />
      </div>

      {terminal ? (
        <p className="text-muted text-sm leading-relaxed">
          {status === "delivered"
            ? "This order has been delivered — the lifecycle is complete."
            : "This order was cancelled and can no longer be updated."}
        </p>
      ) : (
        <>
          <Select
            aria-label="New status"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            hint="Statuses only move forward — cancellation is always possible."
          >
            <option value="">Choose the next status…</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
          </Select>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!selected}
            className={selected === "cancelled" ? "bg-danger hover:bg-danger/85" : undefined}
          >
            {selected === "cancelled" ? "Cancel order" : "Update status"}
          </Button>
        </>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => !updating && setConfirmOpen(false)}
        size="sm"
        title={selected === "cancelled" ? "Cancel order" : "Update status"}
        description={
          selected === "cancelled"
            ? `${orderNumber} will be cancelled.`
            : `${orderNumber} moves from "${label(status)}" to "${label(selected)}".`
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={updating}>
              Keep as is
            </Button>
            <Button
              onClick={confirmUpdate}
              isLoading={updating}
              className={selected === "cancelled" ? "bg-danger hover:bg-danger/85" : undefined}
            >
              {selected === "cancelled" ? "Cancel order" : `Mark ${label(selected)}`}
            </Button>
          </>
        }
      >
        <p className="text-muted text-sm leading-relaxed">
          {selected === "cancelled"
            ? "Cancelled orders are excluded from revenue and can't be reopened."
            : "Statuses only move forward — this can't be undone from the dashboard."}
        </p>
      </Modal>
    </Card>
  );
}
