"use client";

import { useCurrency } from '@/lib/contexts/currency-context';
import { CURRENCIES, CurrencyCode } from '@/lib/currency';
import { useLocale } from 'next-intl';
import { Select } from "@/components/ui/select";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const locale = useLocale() as 'ar' | 'en';

  const currencyList: CurrencyCode[] = ['OMR', 'SAR', 'QAR', 'AED', 'BHD', 'KWD'];

  return (
    <Select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      className="h-9 w-[120px] text-sm border-border/50 bg-background/95 backdrop-blur-sm"
    >
      {currencyList.map((code) => (
        <option key={code} value={code}>
          {locale === 'ar' ? CURRENCIES[code].symbolAr : CURRENCIES[code].code}
        </option>
      ))}
    </Select>
  );
}
