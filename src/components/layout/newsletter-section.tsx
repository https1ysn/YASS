"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

/**
 * Newsletter signup panel. Purely visual for now — submission shows a toast;
 * wire it to a real endpoint later.
 */
export function NewsletterSection() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = React.useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setEmail("");
    toast({
      title: t("toastTitle"),
      description: t("toastDescription"),
      variant: "success",
    });
  }

  return (
    <div className="bg-primary text-primary-foreground shadow-elevated rounded-2xl p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
      <div className="flex max-w-md flex-col gap-3">
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase opacity-70">
          {t("kicker")}
        </p>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h2>
        <p className="text-sm leading-relaxed opacity-80">{t("description")}</p>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row lg:mt-0"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          {t("emailLabel")}
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("placeholder")}
          className="border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-secondary focus:ring-secondary/40 h-12 w-full flex-1 rounded-2xl border px-5 text-sm transition-all focus:ring-2 focus:outline-none"
        />
        <Button type="submit" variant="secondary" size="lg" className="h-12 shrink-0">
          {t("subscribe")}
        </Button>
      </form>
    </div>
  );
}
