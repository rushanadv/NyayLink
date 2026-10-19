import type { Metadata } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "NyayaLink — Operations & Administration",
  description: "Administrative Management Portal for NyayaLink Legal Services Marketplace",
};

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-[#0C0D0C] text-[#EEECE5] antialiased selection:bg-[#B8A078]/25`}
    >
      {children}
    </div>
  );
}
