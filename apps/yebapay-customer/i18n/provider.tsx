import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { translations, type LanguageCode, supportedLanguages } from '@/i18n/translations';

type TranslationParams = Record<string, string | number>;

type TranslationContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  availableLanguages: readonly LanguageCode[];
  t: (key: string, params?: TranslationParams) => string;
};

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

function detectLanguage(): LanguageCode {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  const normalized = locale.split('-')[0];

  if (supportedLanguages.includes(normalized as LanguageCode)) {
    return normalized as LanguageCode;
  }

  return 'fr';
}

function resolveTranslation(language: LanguageCode, key: string): string | undefined {
  const fromLanguage = key
    .split('.')
    .reduce<unknown>((current, segment) => {
      if (current && typeof current === 'object' && segment in current) {
        return (current as Record<string, unknown>)[segment];
      }

      return undefined;
    }, translations[language]);

  if (typeof fromLanguage === 'string') {
    return fromLanguage;
  }

  const fromFallback = key
    .split('.')
    .reduce<unknown>((current, segment) => {
      if (current && typeof current === 'object' && segment in current) {
        return (current as Record<string, unknown>)[segment];
      }

      return undefined;
    }, translations.fr);

  return typeof fromFallback === 'string' ? fromFallback : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    return String(params[key] ?? '');
  });
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>(detectLanguage);

  const value = useMemo<TranslationContextValue>(() => {
    const t = (key: string, params?: TranslationParams) => {
      const resolved = resolveTranslation(language, key);
      return interpolate(resolved ?? key, params);
    };

    return {
      language,
      setLanguage,
      availableLanguages: supportedLanguages,
      t,
    };
  }, [language]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useI18n() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useI18n must be used within TranslationProvider');
  }

  return context;
}
