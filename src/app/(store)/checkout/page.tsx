import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CheckoutForm, CheckoutHeader } from "@/components/checkout";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order.",
};

export default function CheckoutPage() {
  return (
    <Container className="py-8 sm:py-12">
      <CheckoutHeader title="Checkout" currentStep={2} className="mb-8 sm:mb-12" />
      <CheckoutForm />
    </Container>
  );
}
