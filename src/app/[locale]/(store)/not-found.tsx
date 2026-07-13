import { getLocale, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { localeHref } from "@/i18n/alternates";

/** Themed 404 — rendered inside the store shell for unknown URLs and
 * notFound() calls (missing products, collections…). */
export default async function StoreNotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");

  return (
    <Container>
      <div className="py-14 sm:py-20">
        <EmptyState
          title={t("title")}
          description={t("description")}
          icon={
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7"
            >
              <circle cx="9" cy="9" r="5.5" />
              <path d="m13.2 13.2 3.3 3.3M7 9h4" />
            </svg>
          }
          action={<ButtonLink href={localeHref(locale, "/")}>{t("backHome")}</ButtonLink>}
        />
      </div>
    </Container>
  );
}
