"use client";

import { useCurrency } from '@/lib/contexts/currency-context';
import { CURRENCIES, CurrencyCode } from '@/lib/currency';
import { useLocale } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const currencyList: CurrencyCode[] = ['OMR', 'SAR', 'QAR', 'AED', 'BHD', 'KWD'];

interface CurrencySelectorProps {
  /** full = flag + country + code, compact = flag + code only */
  variant?: 'full' | 'compact';
  className?: string;
}

export function CurrencySelector({ variant = 'full', className }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();
  const locale = useLocale() as 'ar' | 'en';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = CURRENCIES[currency];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm',
          'text-sm font-medium transition-colors hover:bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-ring/40',
          variant === 'compact' ? 'px-2 py-1.5 h-9' : 'px-3 py-1.5 h-9',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        {variant === 'full' && (
          <span className="hidden lg:inline">
            {locale === 'ar' ? current.countryAr : current.country}
          </span>
        )}
        <span className="font-semibold">
          {locale === 'ar' ? current.symbolAr : current.symbol}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-[200] mt-1 min-w-[180px] rounded-xl border border-border/60 bg-background shadow-xl',
            locale === 'ar' ? 'right-0' : 'left-0',
          )}
          role="listbox"
        >
          {currencyList.map((code) => {
            const c = CURRENCIES[code];
            const isSelected = code === currency;
            return (
              <button
                key={code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setCurrency(code);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl',
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-secondary/60',
                )}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 text-start">
                  {locale === 'ar' ? c.countryAr : c.country}
                </span>
                <span className="font-medium text-muted-foreground">
                  {locale === 'ar' ? c.symbolAr : c.symbol}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
