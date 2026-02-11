import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { CartStore } from '../../../core/services/cart.store';
import { ProductsMockStore } from '../../../core/services/products-mock.store';
import { UserSessionStore } from '../../../core/services/user-session.store';

@Component({
  selector: 'app-top-bar',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss'
})
export class TopBar {
  isCartBumping = false;
  searchQuery = '';
  private prevQuantity = 0;

  showSuggestions = false;
  accountOpen = false;
  categoriesMenuOpen = false;
  deliveryCity = 'Douala';
  searchSuggestions: { id: string; titre: string }[] = [];
  private suggestionHideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly router: Router,
    private readonly userSession: UserSessionStore,
    private readonly cart: CartStore,
    private readonly products: ProductsMockStore
  ) {
    effect(() => {
      const q = this.cart.totalQuantity();
      if (this.prevQuantity > 0 && q > this.prevQuantity) {
        this.isCartBumping = true;
        setTimeout(() => {
          this.isCartBumping = false;
        }, 300);
      }
      this.prevQuantity = q;
    });
  }

  get isLoggedIn(): boolean {
    return this.userSession.isLoggedIn();
  }

  get userName(): string {
    const session = this.userSession.hasValidSession();
    return session?.nom ?? 'Client';
  }

  get totalQuantity() {
    return this.cart.totalQuantity;
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    this.showSuggestions = false;
    this.router.navigate(['/produits'], {
      queryParams: q ? { q } : {}
    });
  }

  onSearchInput(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (q.length < 2) {
      this.searchSuggestions = [];
      return;
    }
    const all = this.products.products();
    this.searchSuggestions = all
      .filter(
        (p) =>
          p.titre.toLowerCase().includes(q) ||
          p.categorie.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((p) => ({ id: p.id, titre: p.titre }));
  }

  hideSuggestionsSoon(): void {
    this.suggestionHideTimer = setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSuggestion(id: string): void {
    if (this.suggestionHideTimer) {
      clearTimeout(this.suggestionHideTimer);
    }
    this.showSuggestions = false;
    this.router.navigate(['/produits', id]);
  }

  toggleCategoriesMenu(): void {
    this.categoriesMenuOpen = !this.categoriesMenuOpen;
  }

  logout(): void {
    this.userSession.clear();
    this.router.navigateByUrl('/');
  }
}
