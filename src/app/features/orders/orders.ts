import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { TemporalDataStore } from '../../core/services/temporal-data.store';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders {
  constructor(private readonly temporal: TemporalDataStore) {}

  get snapshot() {
    return this.temporal.snapshot;
  }
}
