import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { OrderConfirmation } from "@/components/checkout";
import { estimateDeliveryRange } from "@/lib/delivery";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Thank you — your order has been received.",
};

interface OrderConfirmationPageProps {
  searchParams: Promise<{ order?: string; method?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { order, method } = await searchParams;
  const estimatedDelivery = order
    ? estimateDeliveryRange(method === "express" ? "express" : "standard")
    : undefined;

  return (
    <Container>
      <OrderConfirmation orderNumber={order} estimatedDelivery={estimatedDelivery} />
    </Container>
  );
}
