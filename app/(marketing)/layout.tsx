import type { Metadata } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import { SmoothScrollProvider } from "@/components/marketing/smooth-scroll-provider";
import { ScrollBackground } from "@/components/marketing/scroll-background";
import { CinematicVideoBackground } from "@/components/marketing/cinematic-video-background";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
  title: "NyayLink — Access to Justice, Simplified",
  description:
    "Verified Bar Council lawyers, transparent flat fees, AI-guided legal intake in regional Indian languages, and secure case workspace.",
  keywords: [
    "Legal services India",
    "Find lawyer online",
    "Bar Council verified advocates",
    "Legal intake AI",
    "Advocates Act compliant",
    "Supreme Court lawyer",
    "High Court lawyer",
  ],
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

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fontSerif.variable} ${fontSans.variable} ${fontMono.variable} font-sans min-h-screen bg-[#FFFFFF] text-[#202824] antialiased selection:bg-[#205C43]/20 selection:text-[#202824] relative`}
    >
      <SmoothScrollProvider>
        {/* Dynamic Scroll-Reactive Ambiance Background */}
        <ScrollBackground />

        {/* Cinematic Gold-Ink Video Background with Forest Green Backing */}
        <CinematicVideoBackground />

        {/* Floating Vertical Section Scroll Progress Rail */}
        <ScrollProgress />

        {/* Global Marketing Sticky Navigation */}
        <MarketingNavbar />

        {/* Main Content Area */}
        <main className="relative z-10 pt-20">
          {children}
        </main>

        {/* Marketing Footer */}
        <MarketingFooter />
      </SmoothScrollProvider>
    </div>
  );
}
