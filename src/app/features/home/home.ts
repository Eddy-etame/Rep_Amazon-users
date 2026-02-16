import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartActionsService } from '../../core/services/cart-actions.service';
import { ProductsMockStore } from '../../core/services/products-mock.store';
import { TemporalDataStore } from '../../core/services/temporal-data.store';
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
    { id: '1', title: 'Électronique', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80', link: '/produits' },
    { id: '2', title: 'Mode & Style', image: 'https://img.freepik.com/free-photo/romantic-portrait-woman-long-blue-dress-beach-by-sea-windy-day_343596-938.jpg?w=1920', link: '/produits' },
    { id: '3', title: 'Cuisine', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80', link: '/produits' }
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
