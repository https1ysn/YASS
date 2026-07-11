import * as React from "react";
import { Textarea } from "@/components/ui/textarea";

/** Optional notes for the courier or atelier. */
export function OrderNotes() {
  return (
    <Textarea
      name="orderNotes"
      label="Order notes"
      placeholder="Delivery instructions, gift message, preferred time…"
      hint="Optional."
      rows={4}
    />
  );
}
