"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode } from '@/lib/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'preferred-currency';
const DEFAULT_CURRENCY: CurrencyCode = 'OMR';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load currency from localStorage on mount
  useEffect(() => {
    const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode;
    if (storedCurrency && ['OMR', 'SAR', 'QAR', 'AED', 'BHD', 'KWD'].includes(storedCurrency)) {
      setCurrencyState(storedCurrency);
    }
    setIsInitialized(true);
  }, []);

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  // Don't render children until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
