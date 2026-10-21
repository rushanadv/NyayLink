import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "NyayLink — Operations & Administration",
  description: "Administrative Management Portal for NyayLink Legal Services Marketplace",
};

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
      className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-[#09090F] text-[#F5F4FA] antialiased selection:bg-[#A99AFF]/25 selection:text-white`}
    >
      {children}
    </div>
  );
}
