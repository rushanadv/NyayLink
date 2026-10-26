import type { Metadata } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { SmoothScrollProvider } from "@/components/marketing/smooth-scroll-provider";
import { CinematicVideoBackground } from "@/components/marketing/cinematic-video-background";

export const metadata: Metadata = {
  title: "AI Preconsultation Assistant | NyayLink",
  description:
    "Confidential, plain-language legal preconsultation powered by Indian legal jurisprudence. Receive preliminary informational legal clarity, understand remedies, and connect with verified advocates.",
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
      className={`${fontSerif.variable} ${fontSans.variable} ${fontMono.variable} font-sans min-h-screen bg-[#FFFFFF] text-[#202824] antialiased selection:bg-[#205C43]/20 selection:text-[#202824] flex flex-col justify-between relative overflow-x-hidden`}
    >
      <SmoothScrollProvider>
        {/* Subtle Ambient Green Smoke Video Layer for Intake */}
        <CinematicVideoBackground variant="intake" />

        <MarketingNavbar />
        <div className="flex-1 pt-16 pb-8 sm:pt-20 sm:pb-10 relative z-10">{children}</div>
        <MarketingFooter />
      </SmoothScrollProvider>
    </div>
  );
}
