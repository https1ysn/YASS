import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { OrderConfirmation } from "@/components/checkout";
import { getLocaleAlternates } from "@/i18n/alternates";
import { estimateDeliveryRange } from "@/lib/delivery";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("checkoutConfirmationTitle"),
    description: t("checkoutConfirmationDescription"),
    alternates: { languages: getLocaleAlternates("/checkout/confirmation") },
  };
}

interface OrderConfirmationPageProps {
  searchParams: Promise<{ order?: string; method?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const [{ order, method }, locale] = await Promise.all([searchParams, getLocale()]);
  const estimatedDelivery = order
    ? estimateDeliveryRange(method === "express" ? "express" : "standard", locale as AppLocale)
    : undefined;

  return (
    <Container>
      <OrderConfirmation orderNumber={order} estimatedDelivery={estimatedDelivery} />
    </Container>
  );
}
