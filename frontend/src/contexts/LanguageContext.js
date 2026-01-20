import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from '../utils/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('winestudy_language');
    return saved || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('winestudy_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (path) => getTranslation(language, path);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    translations: translations[language],
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

export default LanguageContext;
