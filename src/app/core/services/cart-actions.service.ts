import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { CartStore } from './cart.store';
import { ProductsMockStore } from './products-mock.store';
import { UserSessionStore } from './user-session.store';

@Injectable({ providedIn: 'root' })
export class CartActionsService {
  constructor(
    private readonly cart: CartStore,
    private readonly products: ProductsMockStore,
    private readonly userSession: UserSessionStore,
    private readonly router: Router
  ) {}

  addProductById(productId: string, redirectUrl?: string): void {
    const product = this.products.byId(productId);
    if (!product) {
      return;
    }

    if (!this.userSession.isLoggedIn()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: redirectUrl || `/produits/${productId}` }
      });
      return;
    }

    this.cart.addItem(product);
  }
}
