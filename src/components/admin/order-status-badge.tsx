import { Badge, type BadgeProps } from "@/components/ui/badge";

const statusVariant: Record<string, BadgeProps["variant"]> = {
  pending: "warning",
  paid: "outline",
  processing: "secondary",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

const paymentLabels: Record<string, string> = {
  cod: "Cash on delivery",
  card: "Card",
  paypal: "PayPal",
};

export function formatPaymentMethod(method: string): string {
  return paymentLabels[method] ?? method;
}

/** Order status pill — one look shared by the list, details and dashboard-adjacent UI. */
export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={statusVariant[status] ?? "muted"} className={className ?? "px-2.5 py-0.5 text-[10px]"}>
      {status}
    </Badge>
  );
}
