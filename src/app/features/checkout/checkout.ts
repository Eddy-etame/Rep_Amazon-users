import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AddressStore } from '../../core/services/address.store';
import { CardValidatorService } from '../../core/services/card-validator.service';
import { CartStore } from '../../core/services/cart.store';
import { EmailService } from '../../core/services/email.service';
import { NotificationSchedulerService } from '../../core/services/notification-scheduler.service';
import { ReceiptService } from '../../core/services/receipt.service';
import { TemporalDataStore } from '../../core/services/temporal-data.store';
import { UserSessionStore } from '../../core/services/user-session.store';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule, RouterLink, AmazCurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
  selectedAddressId = '';
  paymentMethod = 'card';
  promoCode = '';
  promoMessage = '';

  cardNumber = '';
  cardExpiry = '';
  cardCvc = '';
  cardholderName = '';
  cardErrors: { cardNumber?: string; expiry?: string; cvc?: string; cardholderName?: string } = {};

  constructor(
    private readonly cart: CartStore,
    private readonly temporal: TemporalDataStore,
    private readonly router: Router,
    readonly addressStore: AddressStore,
    private readonly cardValidator: CardValidatorService,
    private readonly receipt: ReceiptService,
    private readonly email: EmailService,
    private readonly notificationScheduler: NotificationSchedulerService,
    private readonly userSession: UserSessionStore
  ) {}

  ngOnInit(): void {
    if (!this.addressStore.hasAddresses()) {
      this.router.navigate(['/profil'], { queryParams: { msg: 'address' } });
      return;
    }
    if (!this.cart.items().length) {
      this.router.navigateByUrl('/panier');
      return;
    }
    const defaultAddr = this.addressStore.getDefault();
    if (defaultAddr) {
      this.selectedAddressId = defaultAddr.id;
    }
  }

  get items() {
    return this.cart.items;
  }

  get totalPrice() {
    return this.cart.totalPrice;
  }

  get totalQuantity() {
    return this.cart.totalQuantity;
  }

  get addresses() {
    return this.addressStore.addresses();
  }

  get canConfirm(): boolean {
    const base =
      this.items().length > 0 &&
      !!this.selectedAddressId &&
      !!this.addressStore.getById(this.selectedAddressId);
    if (this.paymentMethod !== 'card') {
      this.cardErrors = {};
      return base;
    }
    const result = this.cardValidator.validateCardDetails({
      cardNumber: this.cardNumber,
      expiry: this.cardExpiry,
      cvc: this.cardCvc,
      cardholderName: this.cardholderName
    });
    this.cardErrors = result.errors;
    return base && result.valid;
  }

  increment(productId: string, current: number): void {
    this.cart.updateQuantity(productId, current + 1);
  }

  decrement(productId: string, current: number): void {
    this.cart.updateQuantity(productId, current - 1);
  }

  remove(productId: string): void {
    this.cart.removeItem(productId);
  }

  formatCardNumber(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 19);
    this.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  formatExpiry(value: string): void {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) {
      this.cardExpiry = v.slice(0, 2) + '/' + v.slice(2);
    } else {
      this.cardExpiry = v;
    }
  }

  applyPromo(): void {
    const code = this.promoCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'PROMO10') {
      this.promoMessage = 'Code appliqué ! (mock)';
    } else {
      this.promoMessage = 'Code invalide';
    }
  }

  async confirmOrder(): Promise<void> {
    if (!this.canConfirm) return;
    const addr = this.addressStore.getById(this.selectedAddressId);
    if (!addr) return;
    const items = this.items();
    const total = this.totalPrice();
    const createdAt = Date.now();
    const nextId = `cmd-${1000 + this.temporal.snapshot().commandes.length + 1}`;
    const orderPayload = {
      id: nextId,
      createdAt,
      items,
      total,
      adresseLivraison: addr,
      methodePaiement: this.paymentMethod
    };
    const receiptDataUrl = await this.receipt.generateReceiptDataUrl(orderPayload);
    const order = this.temporal.addCommandeFromCart(items, {
      adresseLivraison: addr,
      methodePaiement: this.paymentMethod,
      receiptDataUrl
    });
    this.cart.clear();
    const userEmail = this.userSession.hasValidSession()?.email ?? 'client@amaz.demo';
    const blob = this.receipt.generateReceiptPdf(orderPayload);
    const orderForEmail = order ?? { ...orderPayload, statut: 'en_cours' as const };
    await this.email.sendOrderConfirmation(orderForEmail, userEmail, blob);
    if (order) {
      this.notificationScheduler.scheduleOrderNotifications(order);
    }
    this.router.navigateByUrl('/commandes');
  }
}
