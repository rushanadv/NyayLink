import type { Metadata } from "next";
import { ReviewerAccessContent } from "@/components/reviewer/reviewer-access-content";

export const metadata: Metadata = {
  title: "App Store Reviewer Gateway | NyayLink — Indian Legal-Tech Platform",
  description:
    "Dedicated isolated sandbox and reviewer access portal for Apple App Store evaluation of NyayLink. Inspect client and advocate features safely using synthetic test fixtures.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReviewerPage() {
  return <ReviewerAccessContent />;
}
