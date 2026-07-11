import * as React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { BagIcon } from "@/components/layout/icons";

export function EmptyCart() {
  return (
    <EmptyState
      icon={<BagIcon className="size-7" />}
      title="Your bag is empty"
      description="Discover our collections and add your favorite pieces — they'll wait for you here."
      action={
        <ButtonLink href="/shop" size="lg">
          Continue shopping
        </ButtonLink>
      }
    />
  );
}
