import { Injectable, signal } from '@angular/core';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  conversionFactor: number;
}

const FCFA_PER_EUR = 655.957;

const CURRENCIES: Record<string, CurrencyConfig> = {
  EUR: { code: 'EUR', symbol: '€', locale: 'fr-FR', conversionFactor: 1 / FCFA_PER_EUR },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', conversionFactor: 1.05 / FCFA_PER_EUR },
  FCFA: { code: 'XAF', symbol: 'FCFA', locale: 'fr-FR', conversionFactor: 1 }
};

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly currencySignal = signal<CurrencyConfig>(CURRENCIES['EUR']);

  readonly currency = this.currencySignal.asReadonly();

  constructor() {
    this.detectFromLocale();
  }

  private detectFromLocale(): void {
    const lang = typeof navigator !== 'undefined' ? navigator.language : 'fr-FR';
    const langLower = lang.toLowerCase();
    if (langLower.includes('fr') && (langLower.includes('cm') || langLower.includes('cf'))) {
      this.currencySignal.set(CURRENCIES['FCFA']);
    } else if (langLower.includes('en') && langLower.includes('us')) {
      this.currencySignal.set(CURRENCIES['USD']);
    } else {
      this.currencySignal.set(CURRENCIES['EUR']);
    }
  }

  get symbol(): string {
    return this.currency().symbol;
  }

  get code(): string {
    return this.currency().code;
  }

  format(amount: number): string {
    const cfg = this.currency();
    const converted = amount * cfg.conversionFactor;
    if (cfg.code === 'XAF') {
      return `${Math.round(converted).toLocaleString('fr-FR')} ${cfg.symbol}`;
    }
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(converted);
  }

  setCurrency(code: keyof typeof CURRENCIES): void {
    const cfg = CURRENCIES[code];
    if (cfg) {
      this.currencySignal.set(cfg);
    }
  }
}
