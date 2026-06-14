import { Pipe, PipeTransform } from '@angular/core';

import { ServiceDevise } from '../../core/services/service-devise';

@Pipe({ name: 'amazCurrency', pure: true })
export class PipeDeviseAmaz implements PipeTransform {
  constructor(private readonly currency: ServiceDevise) {}

  transform(value: number): string {
    return this.currency.format(value);
  }
}
