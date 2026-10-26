import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "@/components/ui/ai-thinking-orb.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#205C43",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "NyayLink — Access to Justice, Simplified",
  description: "India's Verified Legal Services Marketplace, Client Workspaces, and Advocate Practice Infrastructure",
  applicationName: "NyayLink",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NyayLink",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
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
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

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
            <ServiceWorkerRegister />
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
