import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CartStore } from '../../core/services/cart.store';
import { TemporalDataStore } from '../../core/services/temporal-data.store';
import { UserSessionStore } from '../../core/services/user-session.store';

@Component({
  selector: 'app-cart',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  private searchTerm = '';
  promoCode = '';
  promoMessage = '';

  constructor(
    private readonly cart: CartStore,
    private readonly temporal: TemporalDataStore,
    private readonly router: Router,
    private readonly userSession: UserSessionStore
  ) {}

  get items() {
    return this.cart.items;
  }

  get filteredItems() {
    const all = this.items();
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return all;
    }
    return all.filter((item) => item.titre.toLowerCase().includes(term));
  }

  get totalQuantity() {
    return this.cart.totalQuantity;
  }

  get totalPrice() {
    return this.cart.totalPrice;
  }

  updateSearch(term: string): void {
    this.searchTerm = term;
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

  increment(productId: string, current: number): void {
    this.cart.updateQuantity(productId, current + 1);
  }

  decrement(productId: string, current: number): void {
    this.cart.updateQuantity(productId, current - 1);
  }

  remove(productId: string): void {
    this.cart.removeItem(productId);
  }

  passerCommande(): void {
    const currentItems = this.items();
    if (!currentItems.length) {
      return;
    }
    this.temporal.addCommandeFromCart(currentItems);
    this.cart.clear();
    this.router.navigateByUrl('/commandes');
  }

  goToOrders(): void {
    this.router.navigateByUrl('/commandes');
  }
}
