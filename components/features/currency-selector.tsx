"use client";

import { useCurrency } from '@/lib/contexts/currency-context';
import { CURRENCIES, CurrencyCode } from '@/lib/currency';
import { useLocale } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const currencyList: CurrencyCode[] = ['OMR', 'SAR', 'QAR', 'AED', 'BHD', 'KWD'];

export function CurrencySelector({ className }: { className?: string }) {
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
          'flex items-center gap-1 rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm',
          'px-2 py-1.5 h-9 text-sm font-medium transition-colors',
          'hover:bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-ring/40',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Flag always visible */}
        <span className="text-base leading-none">{current.flag}</span>
        {/* Country name only on large screens */}
        <span className="hidden lg:inline text-sm">
          {locale === 'ar' ? current.countryAr : current.country}
        </span>
        {/* Currency code always visible */}
        <span className="font-semibold text-xs sm:text-sm">
          {locale === 'ar' ? current.symbolAr : current.symbol}
        </span>
        <ChevronDown
          className={cn('h-3 w-3 text-muted-foreground transition-transform shrink-0', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-[200] mt-1 min-w-[190px] rounded-xl border border-border/60 bg-background shadow-xl',
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
                onClick={() => { setCurrency(code); setOpen(false); }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors',
                  'first:rounded-t-xl last:rounded-b-xl',
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
