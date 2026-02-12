import { Pipe, PipeTransform } from '@angular/core';

import { CurrencyService } from '../../core/services/currency.service';

@Pipe({ name: 'amazCurrency', pure: true })
export class AmazCurrencyPipe implements PipeTransform {
  constructor(private readonly currency: CurrencyService) {}

  transform(value: number): string {
    return this.currency.format(value);
  }
}
