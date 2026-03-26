import { Pipe, PipeTransform } from '@angular/core';

import { orderStatusLabelFr, type OrderLifecycleStatus } from '../../core/utils/order-status';

@Pipe({
  name: 'orderStatusLabel',
  standalone: true
})
export class OrderStatusLabelPipe implements PipeTransform {
  transform(value: OrderLifecycleStatus | string | undefined | null): string {
    return orderStatusLabelFr((value as OrderLifecycleStatus) || 'unknown');
  }
}
