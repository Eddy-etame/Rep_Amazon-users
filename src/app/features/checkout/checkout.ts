import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { AddressBookStore } from '../../core/services/address-book.store';
import { CardValidatorService } from '../../core/services/card-validator.service';
import { CartStore } from '../../core/services/cart.store';
import { NotificationSchedulerService } from '../../core/services/notification-scheduler.service';
import { OrdersStateStore } from '../../core/services/orders-state.store';
import { ProductCatalogStore } from '../../core/services/product-catalog.store';
import { ReceiptService } from '../../core/services/receipt.service';
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
  orderError = '';

  constructor(
    private readonly cart: CartStore,
    private readonly ordersState: OrdersStateStore,
    private readonly router: Router,
    readonly addressStore: AddressBookStore,
    private readonly cardValidator: CardValidatorService,
    private readonly receipt: ReceiptService,
    private readonly notificationScheduler: NotificationSchedulerService,
    private readonly productCatalog: ProductCatalogStore
  ) {}

  async ngOnInit(): Promise<void> {
    await this.productCatalog.load().catch(() => undefined);
    await this.addressStore.load().catch(() => undefined);
    if (!this.addressStore.hasAddresses()) {
      await this.router.navigate(['/profil'], { queryParams: { msg: 'address' } });
      return;
    }
    if (!this.cart.items().length) {
      await this.router.navigateByUrl('/panier');
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
    this.orderError = '';
    const items = this.items();
    const invalidLines = items.filter((item) => !String(item.productId || '').trim());
    if (invalidLines.length > 0) {
      this.orderError =
        'Panier invalide : identifiants produit manquants. Videz le panier et réajoutez les articles.';
      return;
    }
    const missingIds = items
      .map((item) => item.productId)
      .filter((id) => !this.productCatalog.byId(id));
    if (missingIds.length > 0) {
      this.orderError =
        'Certains produits ne sont plus dans le catalogue (rupture ou catalogue non chargé). Retournez aux produits puis actualisez le panier.';
      return;
    }
    const total = this.totalPrice();
    const createdAt = Date.now();
    const nextId = `cmd-${1000 + this.ordersState.snapshot().commandes.length + 1}`;
    const orderPayload = {
      id: nextId,
      createdAt,
      items,
      total,
      adresseLivraison: addr,
      methodePaiement: this.paymentMethod
    };
    const receiptDataUrl = await this.receipt.generateReceiptDataUrl(orderPayload);
    let order;
    try {
      order = await this.ordersState.addCommandeFromCart(items, {
        adresseLivraison: addr,
        methodePaiement: this.paymentMethod,
        receiptDataUrl
      });
    } catch (err) {
      const httpErr = err instanceof HttpErrorResponse ? err : null;
      const body = httpErr?.error as { error?: { message?: string; code?: string } } | null | undefined;
      const apiMessage = body?.error?.message;
      const code = body?.error?.code;
      if (httpErr?.status === 404 || code === 'PRODUCT_NOT_FOUND') {
        this.orderError =
          apiMessage?.trim() ||
          'Un ou plusieurs produits sont introuvables ou en rupture côté serveur. Actualisez le catalogue et le panier.';
      } else if (httpErr?.status === 409 || code === 'INSUFFICIENT_STOCK') {
        this.orderError =
          apiMessage?.trim() || 'Stock insuffisant pour au moins un article. Réduisez les quantités.';
      } else {
        this.orderError =
          typeof apiMessage === 'string' && apiMessage.trim()
            ? apiMessage.trim()
            : 'Impossible de confirmer la commande. Réessayez.';
      }
      return;
    }
    if (order) {
      this.cart.clear();
      this.notificationScheduler.scheduleOrderNotifications();
      await this.router.navigate(['/commandes', order.id], { queryParams: { placed: '1' } });
    } else {
      this.orderError = 'Impossible de confirmer la commande. Réessayez.';
    }
  }
}
