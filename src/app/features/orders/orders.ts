import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrdersStateStore } from '../../core/services/orders-state.store';
import { ToastService } from '../../core/services/toast.service';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';
import { OrderStatusLabelPipe } from '../../shared/pipes/order-status-label.pipe';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink, AmazCurrencyPipe, OrderStatusLabelPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders implements OnInit {
  constructor(
    readonly ordersState: OrdersStateStore,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    void this.ordersState.loadOrders();
  }

  get snapshot() {
    return this.ordersState.snapshot;
  }

  async refreshList(): Promise<void> {
    try {
      await this.ordersState.loadOrders();
      this.toast.show('Commandes actualisées.', 'success', 2500);
    } catch {
      this.toast.show('Impossible d’actualiser les commandes.', 'error');
    }
  }

  formatDeliveryDate(ts: number): string {
    return new Date(ts).toLocaleDateString('fr-FR', { dateStyle: 'medium' });
  }
}
