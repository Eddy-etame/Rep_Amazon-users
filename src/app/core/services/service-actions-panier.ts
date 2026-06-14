import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { DepotPanier } from './depot-panier';
import { DepotCatalogueProduits } from './depot-catalogue-produits';
import { DepotSessionUtilisateur } from './depot-session-utilisateur';

@Injectable({ providedIn: 'root' })
export class ServiceActionsPanier {
  constructor(
    private readonly cart: DepotPanier,
    private readonly products: DepotCatalogueProduits,
    private readonly userSession: DepotSessionUtilisateur,
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
