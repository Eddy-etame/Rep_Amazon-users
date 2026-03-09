import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { CartStore } from '../../../core/services/cart.store';
import { ProductsMockStore } from '../../../core/services/products-mock.store';
import { UserSessionStore } from '../../../core/services/user-session.store';
import { VendorBridgeService } from '../../../core/services/vendor-bridge.service';

@Component({
  selector: 'app-top-bar',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss'
})
export class TopBar implements OnInit {
  isCartBumping = false;
  searchQuery = '';
  private prevQuantity = 0;

  searchHistory: string[] = [];
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  readonly popularSearches = ['Casque', 'Smartphone', 'Cuisine', 'Laptop', 'Mode'];

  showSuggestions = false;
  accountOpen = false;
  categoriesMenuOpen = false;
  searchSuggestions: { id: string; titre: string }[] = [];
  private suggestionHideTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly isTouchLike =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  constructor(
    private readonly router: Router,
    private readonly userSession: UserSessionStore,
    private readonly cart: CartStore,
    private readonly products: ProductsMockStore,
    private readonly vendorBridge: VendorBridgeService
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
    this.loadSearchHistory();
  }

  private readonly SEARCH_HISTORY_KEY = 'amaz_search_history';
  private readonly MAX_HISTORY = 8;

  private loadSearchHistory(): void {
    try {
      const raw = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      this.searchHistory = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      this.searchHistory = [];
    }
  }

  private addToSearchHistory(q: string): void {
    if (!q.trim()) return;
    const t = q.trim().toLowerCase();
    this.searchHistory = [t, ...this.searchHistory.filter((h: string) => h !== t)].slice(0, this.MAX_HISTORY);
    localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(this.searchHistory));
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
    if (q) this.addToSearchHistory(q);
    this.router.navigate(['/produits'], {
      queryParams: q ? { q } : {}
    });
  }

  onSearchInput(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.searchDebounceTimer = null;
      this.updateSuggestions();
    }, 250);
  }

  private updateSuggestions(): void {
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
          p.categorie.toLowerCase().includes(q) ||
          (p.descriptionCourte && p.descriptionCourte.toLowerCase().includes(q)) ||
          (p.descriptionDetaillee && p.descriptionDetaillee.toLowerCase().includes(q))
      )
      .slice(0, 8)
      .map((p) => ({ id: p.id, titre: p.titre }));
  }

  applyPopularSearch(term: string): void {
    this.searchQuery = term;
    this.showSuggestions = false;
    this.addToSearchHistory(term);
    this.router.navigate(['/produits'], { queryParams: { q: term } });
  }

  applyHistorySearch(term: string): void {
    this.searchQuery = term;
    this.showSuggestions = false;
    this.router.navigate(['/produits'], { queryParams: { q: term } });
  }

  ngOnInit(): void {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const url = this.router.url;
      const match = url.match(/[?&]q=([^&]+)/);
      if (match) this.searchQuery = decodeURIComponent(match[1]);
      this.accountOpen = false;
      this.showSuggestions = false;
      this.categoriesMenuOpen = false;
    });
    const match = this.router.url.match(/[?&]q=([^&]+)/);
    if (match) this.searchQuery = decodeURIComponent(match[1]);
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

  onAccountMouseEnter(): void {
    if (!this.isTouchLike) {
      this.accountOpen = true;
    }
  }

  onAccountMouseLeave(): void {
    if (!this.isTouchLike) {
      this.accountOpen = false;
    }
  }

  toggleAccountMenu(event: Event): void {
    event.stopPropagation();
    this.accountOpen = !this.accountOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) return;
    const dropdown = this.hostRef.nativeElement.querySelector('.account-dropdown');
    if (dropdown && !dropdown.contains(target)) {
      this.accountOpen = false;
    }
  }

  closeAccountMenu(): void {
    this.accountOpen = false;
  }

  openVendorSpace(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.closeAccountMenu();
    if (!this.vendorBridge.openVendorSpace()) {
      return;
    }
  }

  logout(): void {
    this.accountOpen = false;
    this.userSession.clear();
    this.router.navigateByUrl('/');
  }
}
