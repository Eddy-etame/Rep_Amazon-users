import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TemporalDataStore } from '../../core/services/temporal-data.store';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink, AmazCurrencyPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders {
  constructor(private readonly temporal: TemporalDataStore) {}

  get snapshot() {
    return this.temporal.snapshot;
  }

  formatDeliveryDate(ts: number): string {
    return new Date(ts).toLocaleDateString('fr-FR', { dateStyle: 'medium' });
  }
}
