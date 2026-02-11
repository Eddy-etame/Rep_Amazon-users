import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CartStore } from '../../core/services/cart.store';
import {
  ProductMock,
  ProductsMockStore
} from '../../core/services/products-mock.store';
import { UserSessionStore } from '../../core/services/user-session.store';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail {
  product?: ProductMock;
  selectedImage?: string;
  quantity = 1;
  quantityOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  constructor(
    route: ActivatedRoute,
    products: ProductsMockStore,
    private readonly cart: CartStore,
    private readonly userSession: UserSessionStore,
    private readonly router: Router
  ) {
    const id = route.snapshot.paramMap.get('id');
    if (id) {
      const found = products.byId(id);
      if (found) {
        this.product = found;
        this.selectedImage = found.imagePrincipale;
      }
    }
  }

  selectImage(url: string): void {
    this.selectedImage = url;
  }

  formatStars(note: number): string {
    const full = Math.floor(note);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }

  addToCart(): void {
    if (!this.product) return;
    if (!this.userSession.isLoggedIn()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: `/produits/${this.product.id}` }
      });
      return;
    }
    for (let i = 0; i < this.quantity; i++) {
      this.cart.addItem(this.product);
    }
  }

  buyNow(): void {
    if (!this.product) return;
    if (!this.userSession.isLoggedIn()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: `/produits/${this.product.id}` }
      });
      return;
    }
    for (let i = 0; i < this.quantity; i++) {
      this.cart.addItem(this.product);
    }
    this.router.navigate(['/panier']);
  }
}

