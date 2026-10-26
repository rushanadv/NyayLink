import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content";

export const metadata: Metadata = {
  title: "Privacy Policy | NyayLink — Indian Legal-Tech Platform",
  description:
    "Comprehensive privacy policy for NyayLink under the Digital Personal Data Protection (DPDP) Act, 2023. Real disclosures on data collection, AI preconsultation, voice recognition processing, and user deletion rights.",
  keywords: [
    "NyayLink Privacy Policy",
    "DPDP Act 2023 compliance",
    "Legal tech privacy India",
    "Advocate client confidentiality",
    "Account deletion policy",
  ],
};

export default function PrivacyPage() {
  return <PrivacyPolicyContent />;
}
