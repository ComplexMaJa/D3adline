"use client";

import * as React from "react";
import { Language, TranslationDictionary } from "./types";
import { en } from "./translations/en";
import { id } from "./translations/id";
import { id as localeId } from "date-fns/locale/id";
import { enUS as localeEn } from "date-fns/locale/en-US";
import type { Locale } from "date-fns";

const STORAGE_KEY = "assign_tracker_lang";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
  dateLocale: Locale;
}

const dictionaries: Record<Language, TranslationDictionary> = {
  en,
  id,
};

const dateLocales: Record<Language, Locale> = {
  en: localeEn,
  id: localeId,
};

const LanguageContext = React.createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: en,
  dateLocale: localeEn,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("en");
  const [isMounted, setIsMounted] = React.useState(false);

  // Initialize from localStorage or browser preferences
  React.useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "en" || stored === "id") {
        setLanguageState(stored);
      } else if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("id")) {
        setLanguageState("id");
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === "en" ? "id" : "en";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore localStorage write errors
      }
      return next;
    });
  }, []);

  const value = React.useMemo(() => {
    return {
      language,
      setLanguage,
      toggleLanguage,
      t: dictionaries[language],
      dateLocale: dateLocales[language],
    };
  }, [language, setLanguage, toggleLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
