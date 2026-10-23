import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "NyayLink — Access to Justice, Simplified",
  description: "India's Verified Legal Services Marketplace, Client Workspaces, and Advocate Practice Infrastructure",
  icons: {
    icon: [
      { url: "/brand/nyaylink-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/nyaylink-logo.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/nyaylink-logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/brand/nyaylink-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/brand/nyaylink-logo.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

import { CursorSpotlight } from "@/components/marketing/cursor-spotlight";
import { FilmGrain } from "@/components/marketing/film-grain";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased bg-[#090B10] text-[#F5F4FA]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Subtle Global Ambient Layers */}
          <CursorSpotlight />
          <FilmGrain />

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
