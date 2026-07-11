import * as React from "react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function Copyright() {
  return (
    <div className="border-border border-t">
      <Container>
        <div className="text-muted flex items-center justify-center py-6 text-xs sm:justify-start">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </div>
  );
}
