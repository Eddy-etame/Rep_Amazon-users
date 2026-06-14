import { Injectable, signal } from '@angular/core';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  /** Multiplicateur appliqué au montant catalogue (toujours EUR) pour l'affichage. */
  conversionFactor: number;
}

/** Taux indicatif EUR→USD pour l'affichage en mode USD. */
const EUR_TO_USD_DISPLAY = 1.08;

/**
 * Les montants catalogue / API sont en **euros** (ex. 49.99).
 */
const CURRENCIES = {
  EUR: { code: 'EUR', symbol: '€', locale: 'fr-FR', conversionFactor: 1 },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', conversionFactor: EUR_TO_USD_DISPLAY }
} as const;

export type AmazCurrencyCode = keyof typeof CURRENCIES;

@Injectable({ providedIn: 'root' })
export class ServiceDevise {
  private readonly currencySignal = signal<CurrencyConfig>(CURRENCIES.EUR);

  readonly currency = this.currencySignal.asReadonly();

  constructor() {
    this.detectFromLocale();
  }

  private detectFromLocale(): void {
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
