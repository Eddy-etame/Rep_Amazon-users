import { Component } from '@angular/core';
import { PipeDeviseAmaz } from '../../shared/pipes/pipe-devise';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DepotCarnetAdresses } from '../../core/services/depot-carnet-adresses';
import { DepotPanier } from '../../core/services/depot-panier';

@Component({
  selector: 'app-panier',
  imports: [FormsModule, PipeDeviseAmaz],
  templateUrl: './panier.html',
  styleUrl: './panier.scss'
})
/**
 * Page panier : affiche le contenu du panier (stocké dans DepotPanier) et lance le checkout.
 * La plupart des actions délèguent au store DepotPanier ; la logique métier est dans passerCommande().
 */
export class Panier {
  private searchTerm = '';
  readonly imagePlaceholder = '/product-placeholder.svg';

  constructor(
    private readonly cart: DepotPanier,
    private readonly router: Router,
    private readonly addressStore: DepotCarnetAdresses
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

  increment(productId: string, current: number): void {
    this.cart.updateQuantity(productId, current + 1);
  }

  decrement(productId: string, current: number): void {
    this.cart.updateQuantity(productId, current - 1);
  }

  remove(productId: string): void {
    this.cart.removeItem(productId);
  }

  clearCart(): void {
    this.cart.clear();
  }

  // Passe à la commande : on bloque si le panier est vide, et on redirige vers le profil pour
  // ajouter une adresse si l'utilisateur n'en a aucune (la livraison en a besoin). Sinon -> paiement.
  passerCommande(): void {
    const currentItems = this.items();
    if (!currentItems.length) {
      return;
    }
    if (!this.addressStore.hasAddresses()) {
      this.router.navigate(['/profil'], { queryParams: { msg: 'address' } });
      return;
    }
    this.router.navigateByUrl('/paiement');
  }

  goToOrders(): void {
    this.router.navigateByUrl('/commandes');
  }

  cartImageSrc(url: string | undefined): string {
    const value = String(url || '').trim();
    return value || this.imagePlaceholder;
  }

  onItemImageError(event: Event): void {
    const el = event.target as HTMLImageElement;
    if (!el || el.dataset['fallback'] === '1') {
      return;
    }
    el.dataset['fallback'] = '1';
    el.src = this.imagePlaceholder;
  }
}
