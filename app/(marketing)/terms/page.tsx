import type { Metadata } from "next";
import { TermsOfServiceContent } from "@/components/legal/terms-of-service-content";

export const metadata: Metadata = {
  title: "Terms of Service | NyayLink — Indian Legal-Tech Platform",
  description:
    "Official Terms of Service for NyayLink. Governs platform use, AI preconsultation informational boundaries, advocate-client engagement under the Advocates Act 1961, and Bar Council Rule 36 compliance.",
  keywords: [
    "NyayLink Terms of Service",
    "Advocates Act 1961 compliance",
    "BCI Rule 36 legal terms",
    "Legal tech terms India",
    "Advocate client agreement",
  ],
};

export default function TermsPage() {
  return <TermsOfServiceContent />;
}
