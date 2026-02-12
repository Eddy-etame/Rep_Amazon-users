import { Injectable } from '@angular/core';

const STORAGE_KEY = 'amaz_sent_emails';

interface StoredEmail {
  type: string;
  to: string;
  subject: string;
  body?: string;
  at: number;
}

interface OrderLike {
  id: string;
  total?: number;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  async sendOrderConfirmation(order: OrderLike, userEmail: string, _receiptBlob?: Blob): Promise<void> {
    const subject = `Confirmation de commande ${order.id}`;
    const body = `Votre commande ${order.id} a été confirmée.\n\nTotal: ${order.total?.toLocaleString('fr-FR')} FCFA\n\nUn reçu PDF est joint à cet email.`;
    this.logAndStore('order_confirmation', userEmail, subject, body);
  }

  async sendDeliveryReminder(order: OrderLike, userEmail: string): Promise<void> {
    const subject = `Votre commande ${order.id} arrive aujourd'hui`;
    const body = `Votre commande ${order.id} sera livrée aujourd'hui.`;
    this.logAndStore('delivery_reminder', userEmail, subject, body);
  }

  async sendOrderDelivered(order: OrderLike, userEmail: string): Promise<void> {
    const subject = `Commande ${order.id} livrée`;
    const body = `Votre commande ${order.id} a été livrée avec succès.`;
    this.logAndStore('order_delivered', userEmail, subject, body);
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const subject = 'Code de vérification Amaz';
    const body = `Votre code de vérification est : ${code}`;
    this.logAndStore('verification_code', to, subject, body);
  }

  private logAndStore(type: string, to: string, subject: string, body?: string): void {
    const entry: StoredEmail = { type, to, subject, body, at: Date.now() };
    console.log('[Email mock]', entry);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: StoredEmail[] = raw ? JSON.parse(raw) : [];
      list.push(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}
