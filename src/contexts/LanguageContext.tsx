import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, languages, getTranslation, Translations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('wasfa-language') as Language;
    if (savedLang && languages[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = languages[language].dir;
    document.documentElement.lang = language;
    localStorage.setItem('wasfa-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: getTranslation(language),
    dir: languages[language].dir,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
