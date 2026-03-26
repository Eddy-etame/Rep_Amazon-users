import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartActionsService } from '../../core/services/cart-actions.service';
import { OrdersStateStore } from '../../core/services/orders-state.store';
import { ProductCatalogStore } from '../../core/services/product-catalog.store';
import { UserSessionStore } from '../../core/services/user-session.store';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, DecimalPipe, AmazCurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  private slideInterval: ReturnType<typeof setInterval> | null = null;
  private readonly SLIDE_INTERVAL_MS = 5000;

  currentSlideIndex = 0;
  carouselHovered = false;

  constructor(
    private readonly userSession: UserSessionStore,
    private readonly ordersState: OrdersStateStore,
    private readonly products: ProductCatalogStore,
    readonly cartActions: CartActionsService
  ) {}

  get isLoggedIn(): boolean {
    return this.userSession.isLoggedIn();
  }

  get session() {
    return this.userSession.session;
  }

  get snapshot() {
    return this.ordersState.snapshot;
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

  readonly carouselSlides: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    link: string;
    queryParams?: Record<string, string>;
  }[] = [
    {
      id: '1',
      title: 'Électronique',
      subtitle: 'Découvrir la sélection',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80',
      link: '/produits',
      queryParams: { categorie: 'Électronique' }
    },
    {
      id: '2',
      title: 'Mode & style',
      subtitle: 'Voir le catalogue',
      image: 'https://img.freepik.com/free-photo/romantic-portrait-woman-long-blue-dress-beach-by-sea-windy-day_343596-938.jpg?w=1920',
      link: '/produits',
      queryParams: { categorie: 'Mode' }
    },
    {
      id: '3',
      title: 'Cuisine',
      subtitle: 'Explorer les produits',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80',
      link: '/produits',
      queryParams: { categorie: 'Cuisine' }
    }
  ];

  ngOnInit(): void {
    this.startSlideInterval();
  }

  ngOnDestroy(): void {
    this.stopSlideInterval();
  }

  private startSlideInterval(): void {
    this.stopSlideInterval();
    this.slideInterval = setInterval(() => {
      if (!this.carouselHovered) {
        this.nextSlide();
      }
    }, this.SLIDE_INTERVAL_MS);
  }

  private stopSlideInterval(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.carouselSlides.length;
  }

  prevSlide(): void {
    this.currentSlideIndex = this.currentSlideIndex === 0
      ? this.carouselSlides.length - 1
      : this.currentSlideIndex - 1;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  onCarouselMouseEnter(): void {
    this.carouselHovered = true;
  }

  onCarouselMouseLeave(): void {
    this.carouselHovered = false;
  }
}
