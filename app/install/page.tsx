import type { Metadata } from "next";
import { InstallLanding } from "@/components/pwa/install-landing";

export const metadata: Metadata = {
  title: "Install NyayLink — Legal Access, Reimagined",
  description:
    "Meet NyayLink. Understand your legal options, explore advocates, and prepare for your next step. Scan the QR code or install directly to your device as a fast Progressive Web App.",
  alternates: {
    canonical: "https://nyay.live/install",
  },
  openGraph: {
    title: "Install NyayLink — Legal Access, Reimagined",
    description:
      "Understand your legal options, explore advocates, and prepare for your next step. Add NyayLink to your phone's home screen.",
    url: "https://nyay.live/install",
    siteName: "NyayLink",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "NyayLink Legal Access",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Install NyayLink — Legal Access, Reimagined",
    description:
      "Understand your legal options, explore advocates, and prepare for your next step. Add NyayLink to your home screen.",
    images: ["/twitter-image.png"],
  },
  keywords: [
    "NyayLink PWA",
    "Install NyayLink",
    "Legal tech app India",
    "AI preconsultation mobile",
    "Advocate directory mobile",
    "Legal access India",
  ],
};

export default function InstallPage() {
  return <InstallLanding />;
}
