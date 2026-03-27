import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../lib/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default to English, or detect browser language if needed
  // For now, default to 'en' as per initial state, but we can switch to 'zh' if requested
  const [language, setLanguage] = useState('zh'); // Defaulting to 'zh' as per user request to "Add Chinese"

  const t = (key) => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    return translation;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
