import type { Metadata } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { SmoothScrollProvider } from "@/components/marketing/smooth-scroll-provider";

export const metadata: Metadata = {
  title: "AI Legal Intake Assistant | NyayLink",
  description:
    "Confidential, plain-language legal intake powered by Indian legal jurisprudence. Receive preliminary legal clarity, understand remedies, and connect with verified advocates.",
};

const fontSerif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function IntakeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fontSerif.variable} ${fontSans.variable} ${fontMono.variable} font-sans min-h-screen bg-[#090B10] text-[#F5F4FA] antialiased selection:bg-[#C5A059]/30 selection:text-white flex flex-col justify-between`}
    >
      <SmoothScrollProvider>
        <MarketingNavbar />
        <div className="flex-1 pt-24 pb-16">{children}</div>
        <MarketingFooter />
      </SmoothScrollProvider>
    </div>
  );
}
