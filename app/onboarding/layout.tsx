import type { Metadata } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import { CinematicVideoBackground } from "@/components/marketing/cinematic-video-background";

export const metadata: Metadata = {
  title: "Welcome to NyayLink | Onboarding & Language Selection",
  description:
    "Choose your language and get started on NyayLink — India's verified legal services marketplace and advocate practice infrastructure.",
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

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fontSerif.variable} ${fontSans.variable} ${fontMono.variable} font-sans min-h-screen bg-[#FDFEFC] text-[#202824] antialiased selection:bg-[#205C43]/20 selection:text-[#202824] flex flex-col justify-between relative overflow-x-hidden`}
    >
      {/* Subtle Ambient Video Background */}
      <CinematicVideoBackground variant="portal" />
      <div className="flex-1 flex flex-col justify-center relative z-10 py-8 sm:py-12 px-4 sm:px-6">
        {children}
      </div>
    </div>
  );
}
