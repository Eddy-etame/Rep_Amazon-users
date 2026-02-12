import { Injectable } from '@angular/core';

export interface CardDetails {
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardholderName: string;
}

export interface CardValidationResult {
  valid: boolean;
  errors: {
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    cardholderName?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CardValidatorService {
  /**
   * Validates card number using Luhn algorithm.
   * Expects digits only (13-19 chars).
   */
  validateCardNumber(num: string): boolean {
    const digits = num.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    return this.luhnCheck(digits);
  }

  private luhnCheck(digits: string): boolean {
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  /**
   * Validates expiry in MM/YY format. Must be in the future.
   */
  validateExpiry(exp: string): boolean {
    const m = exp.trim().match(/^(\d{1,2})\s*\/\s*(\d{2})$/);
    if (!m) return false;
    const month = parseInt(m[1], 10);
    const year = parseInt(m[2], 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const fullYear = 2000 + year;
    const expDate = new Date(fullYear, month - 1, 1);
    if (expDate.getFullYear() < now.getFullYear()) return false;
    if (expDate.getFullYear() === now.getFullYear() && expDate.getMonth() < now.getMonth()) return false;
    return true;
  }

  /**
   * Validates CVC. 3 digits for most cards, 4 for Amex.
   */
  validateCvc(cvc: string, isAmex = false): boolean {
    const digits = cvc.replace(/\D/g, '');
    return isAmex ? digits.length === 4 : digits.length === 3;
  }

  /**
   * Checks if card number starts with Amex prefix (34 or 37).
   */
  isAmex(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    return digits.startsWith('34') || digits.startsWith('37');
  }

  validateCardDetails(details: CardDetails): CardValidationResult {
    const errors: CardValidationResult['errors'] = {};
    const num = details.cardNumber.replace(/\s/g, '');
    if (!this.validateCardNumber(num)) {
      errors.cardNumber = 'Numéro de carte invalide (format et vérification Luhn)';
    }
    if (!this.validateExpiry(details.expiry)) {
      errors.expiry = 'Date d\'expiration invalide (MM/YY, future)';
    }
    const amex = this.isAmex(num);
    if (!this.validateCvc(details.cvc, amex)) {
      errors.cvc = amex ? 'CVC invalide (4 chiffres pour Amex)' : 'CVC invalide (3 chiffres)';
    }
    const name = details.cardholderName.trim();
    if (name.length < 2) {
      errors.cardholderName = 'Nom du titulaire requis (min 2 caractères)';
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}
