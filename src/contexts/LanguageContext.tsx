import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  LANGUAGE_STORAGE_KEY,
  LANGUAGES,
  translate,
  type CopyKey,
  type Language,
} from "../i18n/copy";

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  t: (key: CopyKey, values?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && LANGUAGES.includes(value as Language);
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useLocalStorage<Language>(
    LANGUAGE_STORAGE_KEY,
    "en",
    isLanguage
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => (current === "en" ? "az" : "en"));
  }, [setLanguage]);

  const value = useMemo(
    () => ({
      language,
      toggleLanguage,
      t: (key: CopyKey, values?: Record<string, string | number>) =>
        translate(language, key, values),
    }),
    [language, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider.");
  return context;
}
