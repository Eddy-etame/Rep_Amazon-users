import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { DepotCarnetAdresses } from '../../core/services/depot-carnet-adresses';
import { ServiceValidationCarte } from '../../core/services/service-validation-carte';
import { DepotPanier } from '../../core/services/depot-panier';
import { DepotEtatCommandes } from '../../core/services/depot-etat-commandes';
import { DepotCatalogueProduits } from '../../core/services/depot-catalogue-produits';
import { ServiceRecu } from '../../core/services/service-recu';
import { PipeDeviseAmaz } from '../../shared/pipes/pipe-devise';

@Component({
  selector: 'app-paiement',
  imports: [FormsModule, RouterLink, PipeDeviseAmaz],
  templateUrl: './paiement.html',
  styleUrl: './paiement.scss'
})
export class Paiement implements OnInit {
  selectedAddressId = '';
  paymentMethod = 'card';

  cardNumber = '';
  cardExpiry = '';
  cardCvc = '';
  cardholderName = '';
  cardErrors: { cardNumber?: string; expiry?: string; cvc?: string; cardholderName?: string } = {};
  orderError = '';
  confirmInFlight = false;

  constructor(
    private readonly cart: DepotPanier,
    private readonly ordersState: DepotEtatCommandes,
    private readonly router: Router,
    readonly addressStore: DepotCarnetAdresses,
    private readonly cardValidator: ServiceValidationCarte,
    private readonly receipt: ServiceRecu,
    private readonly productCatalog: DepotCatalogueProduits
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
    this.refreshCardErrorsFromState();
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

  /** Sync displayed field errors (call after any card / payment field change). */
  refreshCardErrorsFromState(): void {
    if (this.paymentMethod !== 'card') {
      this.cardErrors = {};
      return;
    }
    this.cardErrors = this.cardValidator.validateCardDetails({
      cardNumber: this.cardNumber,
      expiry: this.cardExpiry,
      cvc: this.cardCvc,
      cardholderName: this.cardholderName
    }).errors;
  }

  /** Read-only: no side effects (avoids NG0100 when used from template). */
  get canConfirm(): boolean {
    const base =
      this.items().length > 0 &&
      !!this.selectedAddressId &&
      !!this.addressStore.getById(this.selectedAddressId);
    if (this.paymentMethod !== 'card') {
      return base;
    }
    const result = this.cardValidator.validateCardDetails({
      cardNumber: this.cardNumber,
      expiry: this.cardExpiry,
      cvc: this.cardCvc,
      cardholderName: this.cardholderName
    });
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
    this.refreshCardErrorsFromState();
  }

  formatExpiry(value: string): void {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) {
      this.cardExpiry = v.slice(0, 2) + '/' + v.slice(2);
    } else {
      this.cardExpiry = v;
    }
    this.refreshCardErrorsFromState();
  }

  onCardCvcChange(value: string): void {
    this.cardCvc = value.replace(/\D/g, '').slice(0, 4);
    this.refreshCardErrorsFromState();
  }

  async confirmOrder(): Promise<void> {
    this.refreshCardErrorsFromState();
    if (!this.canConfirm || this.confirmInFlight) return;
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
    let order;
    this.confirmInFlight = true;
    try {
      order = await this.ordersState.addCommandeFromCart(items, {
        adresseLivraison: addr,
        methodePaiement: this.paymentMethod
      });
    } catch (err) {
      const httpErr = err instanceof HttpErrorResponse ? err : null;
      const body = httpErr?.error as { error?: { message?: string; code?: string } } | null | undefined;
      const apiMessage = body?.error?.message;
      const code = body?.error?.code;
      if (httpErr?.status === 404 && code === 'NOT_FOUND') {
        this.orderError =
          'Service de commandes temporairement indisponible. Veuillez réessayer.';
      } else if (
        httpErr?.status === 422 ||
        httpErr?.status === 404 ||
        code === 'PRODUCT_NOT_FOUND'
      ) {
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
    } finally {
      this.confirmInFlight = false;
    }
    if (order) {
      const receiptDataUrl = await this.receipt.generateReceiptDataUrl({
        id: order.id,
        createdAt: order.createdAt,
        items,
        total: order.total ?? this.totalPrice(),
        adresseLivraison: addr,
        methodePaiement: this.paymentMethod
      });
      this.ordersState.storeReceipt(order.id, receiptDataUrl);
      this.cart.clear();
      await this.router.navigate(['/commandes', order.id], { queryParams: { placed: '1' } });
    } else {
      this.orderError = 'Impossible de confirmer la commande. Réessayez.';
    }
  }
}
