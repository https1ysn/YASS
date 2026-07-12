import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { CheckoutForm, CheckoutHeader } from "@/components/checkout";
import { getLocaleAlternates } from "@/i18n/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("checkoutTitle"),
    description: t("checkoutDescription"),
    alternates: { languages: getLocaleAlternates("/checkout") },
  };
}

export default async function CheckoutPage() {
  const t = await getTranslations("metadata");

  return (
    <Container className="py-8 sm:py-12">
      <CheckoutHeader title={t("checkoutTitle")} currentStep={2} className="mb-8 sm:mb-12" />
      <CheckoutForm />
    </Container>
  );
}
