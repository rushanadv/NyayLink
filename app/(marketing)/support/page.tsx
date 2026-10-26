import type { Metadata } from "next";
import { SupportCenterContent } from "@/components/support/support-center-content";

export const metadata: Metadata = {
  title: "Support & Contact | NyayLink — Indian Legal-Tech Platform",
  description:
    "Official support center for NyayLink. Get help with login issues, account deletion instructions, document vault controls, AI preconsultation troubleshooting, and direct support desk contact.",
  keywords: [
    "NyayLink Support",
    "Contact NyayLink",
    "Account deletion help",
    "Legal tech support India",
    "Grievance redressal",
  ],
};

export default function SupportPage() {
  return <SupportCenterContent />;
}
