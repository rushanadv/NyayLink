"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Locale, Dictionary } from "./types";
import { en } from "./dictionaries/en";
import { hi } from "./dictionaries/hi";

const dictionaries: Record<Locale, Dictionary> = { en, hi };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const COOKIE_NAME = "nyaylink_locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";

  // 1. Try reading cookie
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (match && (match[1] === "en" || match[1] === "hi")) {
    return match[1] as Locale;
  }

  // 2. Try localStorage
  try {
    const saved = localStorage.getItem(COOKIE_NAME);
    if (saved === "en" || saved === "hi") {
      return saved as Locale;
    }
  } catch {}

  return "en";
}

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Sync client-side on mount if a cookie/localStorage was set
  useEffect(() => {
    const stored = getInitialLocale();
    setLocaleState((prev) => (stored !== prev ? stored : prev));
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);

    // Persist via cookie (1 year expiry, Lax)
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
      try {
        localStorage.setItem(COOKIE_NAME, newLocale);
      } catch {}
    }
  }, []);

  const value: LanguageContextType = {
    locale,
    setLocale,
    t: dictionaries[locale] || dictionaries.en,
    isHindi: locale === "hi",
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback when rendered outside provider (e.g. tests or isolated components)
    return {
      locale: "en",
      setLocale: () => {},
      t: en,
      isHindi: false,
    };
  }
  return context;
}

export function useTranslation(): Dictionary {
  return useLanguage().t;
}
