import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function Copyright({ name }: { name: string }) {
  const t = await getTranslations("footer");

  return (
    <div className="border-border border-t">
      <Container>
        <div className="text-muted flex items-center justify-center py-6 text-xs sm:justify-start">
          <p>{t("copyright", { year: new Date().getFullYear(), name })}</p>
        </div>
      </Container>
    </div>
  );
}
