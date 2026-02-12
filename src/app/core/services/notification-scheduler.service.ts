import { Injectable } from '@angular/core';

import { EmailService } from './email.service';
import { TemporalDataStore } from './temporal-data.store';
import { UserSessionStore } from './user-session.store';

const DELIVERY_TIME_HOUR = 14; // 14:00

@Injectable({ providedIn: 'root' })
export class NotificationSchedulerService {
  private scheduled = new Set<string>();

  constructor(
    private readonly temporal: TemporalDataStore,
    private readonly email: EmailService,
    private readonly userSession: UserSessionStore
  ) {}

  scheduleOrderNotifications(order: { id: string; deliveryDate?: number; statut?: string }): void {
    if (this.scheduled.has(order.id)) return;
    if (order.statut !== 'en_cours' || !order.deliveryDate) return;

    const userEmail = this.userSession.hasValidSession()?.email ?? 'client@amaz.demo';
    const now = Date.now();
    const deliveryDate = order.deliveryDate;

    if (deliveryDate <= now) {
      this.triggerDelivered(order.id, userEmail);
      return;
    }

    const deliveryDay = new Date(deliveryDate);
    deliveryDay.setHours(DELIVERY_TIME_HOUR, 0, 0, 0);
    const reminderTime = new Date(deliveryDate);
    reminderTime.setHours(9, 0, 0, 0);
    const deliveredTime = deliveryDay.getTime();

    const delayReminder = Math.max(0, reminderTime.getTime() - now);
    const delayDelivered = Math.max(0, deliveredTime - now);

    this.scheduled.add(order.id);

    setTimeout(() => {
      const cmd = this.temporal.getOrderById(order.id);
      if (cmd?.statut === 'en_cours') {
        this.email.sendDeliveryReminder(cmd, userEmail);
      }
    }, delayReminder);

    setTimeout(() => {
      this.triggerDelivered(order.id, userEmail);
    }, delayDelivered);
  }

  private triggerDelivered(orderId: string, userEmail: string): void {
    this.temporal.markDelivered(orderId);
    const cmd = this.temporal.getOrderById(orderId);
    if (cmd) {
      this.email.sendOrderDelivered(cmd, userEmail);
    }
    this.scheduled.delete(orderId);
  }

  init(): void {
    const orders = this.temporal.snapshot().commandes;
    const userEmail = this.userSession.hasValidSession()?.email ?? 'client@amaz.demo';
    for (const order of orders) {
      if (order.statut === 'en_cours' && order.deliveryDate) {
        this.scheduleOrderNotifications({ ...order, statut: order.statut });
      }
    }
  }
}
