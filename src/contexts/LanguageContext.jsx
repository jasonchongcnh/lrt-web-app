import { useCallback, useEffect, useMemo, useState } from 'react';
import { translations } from '../lib/translations';
import { LanguageContext } from './language';

const STORAGE_KEY = 'macao-lrt-language';
const languageTags = { zh: 'zh-Hant', 'zh-CN': 'zh-Hans', en: 'en', pt: 'pt' };
const isLanguage = (value) => Object.hasOwn(languageTags, value);

function readLanguage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Keep the app usable when browser storage is unavailable.
  }
  return 'zh';
}

export const LanguageProvider = ({ children }) => {
  const [language, updateLanguage] = useState(readLanguage);
  const setLanguage = useCallback((value) => {
    updateLanguage((previous) => {
      const next = typeof value === 'function' ? value(previous) : value;
      return isLanguage(next) ? next : previous;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = languageTags[language];
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Language switching still works for this visit without storage.
    }
  }, [language]);

  const t = useCallback((key) => (
    translations[language][key] ?? translations.en[key] ?? key
  ), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
