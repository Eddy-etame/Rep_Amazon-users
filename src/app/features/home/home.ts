import { CommonModule, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartActionsService } from '../../core/services/cart-actions.service';
import { TemporalDataStore } from '../../core/services/temporal-data.store';
import { ProductsMockStore } from '../../core/services/products-mock.store';
import { UserSessionStore } from '../../core/services/user-session.store';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  constructor(
    private readonly userSession: UserSessionStore,
    private readonly temporal: TemporalDataStore,
    private readonly products: ProductsMockStore,
    readonly cartActions: CartActionsService
  ) {}

  get isLoggedIn(): boolean {
    return this.userSession.isLoggedIn();
  }

  get session() {
    return this.userSession.session;
  }

  get snapshot() {
    return this.temporal.snapshot;
  }

  getProductImage(productId: string): string | null {
    const found = this.products.byId(productId);
    return found ? found.imagePrincipale : null;
  }

  getProduct(productId: string) {
    return this.products.byId(productId);
  }

  formatStars(note: number): string {
    const full = Math.floor(note);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }

  carouselSlides = [
    { id: '1', title: 'Électronique', image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=1200', link: '/produits' },
    { id: '2', title: 'Mode & Style', image: 'https://images.pexels.com/photos/374746/pexels-photo-374746.jpeg?auto=compress&cs=tinysrgb&w=1200', link: '/produits' },
    { id: '3', title: 'Cuisine', image: 'https://images.pexels.com/photos/3738028/pexels-photo-3738028.jpeg?auto=compress&cs=tinysrgb&w=1200', link: '/produits' }
  ];
}
