'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  autoTranslate: boolean;
  setAutoTranslate: (value: boolean) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedSettings = localStorage.getItem('npm-upgrade-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoTranslate(settings.autoTranslate);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const settings = { autoTranslate };
      localStorage.setItem('npm-upgrade-settings', JSON.stringify(settings));
    }
  }, [autoTranslate, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <TranslationContext.Provider value={{ autoTranslate, setAutoTranslate }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
} 