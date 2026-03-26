import { Injectable, signal } from '@angular/core';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  /** Multiply catalog amount (always EUR) for display. */
  conversionFactor: number;
}

/** Rough EUR→USD when the UI is in USD mode. */
const EUR_TO_USD_DISPLAY = 1.08;

/**
 * Catalog/API amounts are **euros** (e.g. 49.99).
 */
const CURRENCIES = {
  EUR: { code: 'EUR', symbol: '€', locale: 'fr-FR', conversionFactor: 1 },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', conversionFactor: EUR_TO_USD_DISPLAY }
} as const;

export type AmazCurrencyCode = keyof typeof CURRENCIES;

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly currencySignal = signal<CurrencyConfig>(CURRENCIES.EUR);

  readonly currency = this.currencySignal.asReadonly();

  constructor() {
    this.detectFromLocale();
  }

  private detectFromLocale(): void {
    // Catalogue amounts are EUR; keep EUR default so prices match seed data (no silent USD conversion).
    this.currencySignal.set(CURRENCIES.EUR);
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
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(converted);
  }

  setCurrency(code: AmazCurrencyCode): void {
    const cfg = CURRENCIES[code];
    if (cfg) {
      this.currencySignal.set(cfg);
    }
  }
}
