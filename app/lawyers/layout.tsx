import type { Metadata } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { SmoothScrollProvider } from "@/components/marketing/smooth-scroll-provider";
import { CinematicVideoBackground } from "@/components/marketing/cinematic-video-background";

export const metadata: Metadata = {
  title: "Advocate Directory & Verified Roster | NyayLink",
  description:
    "Browse Bar Council enrolled advocates across India. Explore verified practitioners and profiles under review with upfront, transparent terms.",
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

export default function LawyersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fontSerif.variable} ${fontSans.variable} ${fontMono.variable} font-sans min-h-screen bg-[#FFFFFF] text-[#202824] antialiased selection:bg-[#205C43]/20 selection:text-[#202824] flex flex-col justify-between relative overflow-x-hidden`}
    >
      <SmoothScrollProvider>
        {/* Subtle Ambient Peripheral Green Smoke Video Layer for Lawyers Directory */}
        <CinematicVideoBackground variant="lawyers" />

        <MarketingNavbar />
        <div className="flex-1 pt-24 pb-16 relative z-10">{children}</div>
        <MarketingFooter />
      </SmoothScrollProvider>
    </div>
  );
}
