import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "@/components/ui/ai-thinking-orb.css";

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

import { cookies } from "next/headers";
import { LanguageProvider } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/types";
import { CursorSpotlight } from "@/components/marketing/cursor-spotlight";
import { FilmGrain } from "@/components/marketing/film-grain";
import { AppSplashProvider } from "@/components/ui/app-splash-provider";

export const instant = false;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("nyaylink_locale")?.value;
  const initialLocale: Locale = rawLocale === "hi" ? "hi" : "en";
  const hasSeenSplash = cookieStore.get("nyaylink_splash_seen")?.value === "true";

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        {/* Synchronously prevent white flash on reload/navigation for sessions that have already completed splash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('nyaylink_initial_splash_shown')||document.cookie.indexOf('nyaylink_splash_seen=true')!==-1){document.documentElement.classList.add('splash-already-seen');}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.className} antialiased bg-[#090B10] text-[#F5F4FA]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider initialLocale={initialLocale}>
            {/* Subtle Global Ambient Layers */}
            <CursorSpotlight />
            <FilmGrain />

            <AppSplashProvider initialSplashSeen={hasSeenSplash}>
              {children}
            </AppSplashProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
