import { Pipe, PipeTransform } from '@angular/core';

import { orderStatusLabelFr, type OrderLifecycleStatus } from '../../core/utils/statut-commande';

@Pipe({
  name: 'orderStatusLabel',
  standalone: true
})
export class PipeLibelleStatutCommande implements PipeTransform {
  transform(value: OrderLifecycleStatus | string | undefined | null): string {
    return orderStatusLabelFr((value as OrderLifecycleStatus) || 'unknown');
  }
}
