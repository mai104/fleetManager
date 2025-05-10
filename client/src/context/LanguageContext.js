import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '../i18n/translations';

// Create the language context
const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Language provider component
export const LanguageProvider = ({ children }) => {
  // Check for saved language preference or use English as default
  const savedLanguage = localStorage.getItem('language') || 'en';
  const [language, setLanguage] = useState(savedLanguage);
  
  // Toggle language function
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };
  
  // Translation function
  const t = (key) => {
    const translation = translations[language];
    return translation[key] || key;
  };
  
  // Apply language direction to body when language changes
  useEffect(() => {
    const body = document.body;
    
    if (language === 'ar') {
      body.setAttribute('dir', 'rtl');
      body.classList.add('rtl');
      document.documentElement.lang = 'ar';
    } else {
      body.setAttribute('dir', 'ltr');
      body.classList.remove('rtl');
      document.documentElement.lang = 'en';
    }
  }, [language]);
  
  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
