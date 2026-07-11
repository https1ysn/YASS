import * as React from "react";
import { Input } from "@/components/ui/input";

/** Contact fields — uncontrolled, validated natively via required/type. */
export function ContactInformation() {
  return (
    <div className="flex flex-col gap-5">
      <Input
        name="fullName"
        label="Full name"
        placeholder="e.g. Yassine El Amrani"
        autoComplete="name"
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          name="phone"
          type="tel"
          label="Phone number"
          placeholder="+212 6 12 34 56 78"
          autoComplete="tel"
          required
        />
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          hint="Optional — for your order updates."
        />
      </div>
    </div>
  );
}
