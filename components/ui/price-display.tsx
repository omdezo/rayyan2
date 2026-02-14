"use client";

import { useCurrency } from '@/lib/contexts/currency-context';
import { formatPrice } from '@/lib/currency';
import { useLocale } from 'next-intl';

interface PriceDisplayProps {
  priceInOMR: number;
  className?: string;
  decimals?: number;
}

export function PriceDisplay({ priceInOMR, className, decimals }: PriceDisplayProps) {
  const { currency } = useCurrency();
  const locale = useLocale() as 'ar' | 'en';

  return (
    <span className={className}>
      {formatPrice(priceInOMR, currency, locale, decimals)}
    </span>
  );
}
