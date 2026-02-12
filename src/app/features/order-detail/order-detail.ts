import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OrderReturnService } from '../../core/services/order-return.service';
import { TemporalDataStore } from '../../core/services/temporal-data.store';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

const RETURN_DAYS = 14;

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, AmazCurrencyPipe],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss'
})
export class OrderDetail {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly temporal: TemporalDataStore,
    readonly orderReturn: OrderReturnService
  ) {}

  get orderId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  get order() {
    const id = this.orderId;
    return id ? this.temporal.getOrderById(id) : undefined;
  }

  get canReturn(): boolean {
    const o = this.order;
    if (!o || o.statut !== 'livree' || !o.deliveredAt) return false;
    const deadline = o.deliveredAt + RETURN_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() <= deadline;
  }

  get returnDeadline(): string | null {
    const o = this.order;
    if (!o?.deliveredAt) return null;
    const d = new Date(o.deliveredAt + RETURN_DAYS * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString('fr-FR', { dateStyle: 'long' });
  }

  get hasReturnRequest(): boolean {
    const id = this.orderId;
    return id ? this.orderReturn.hasReturnRequest(id) : false;
  }

  requestReturn(): void {
    const id = this.orderId;
    if (id) this.orderReturn.requestReturn(id);
  }

  downloadReceipt(): void {
    const o = this.order;
    if (!o?.receiptDataUrl) return;
    const link = document.createElement('a');
    link.href = o.receiptDataUrl;
    link.download = `recu-${o.id}.pdf`;
    link.click();
  }

  formatDate(ts: number | undefined): string {
    if (!ts) return '-';
    return new Date(ts).toLocaleDateString('fr-FR', { dateStyle: 'medium' });
  }
}
