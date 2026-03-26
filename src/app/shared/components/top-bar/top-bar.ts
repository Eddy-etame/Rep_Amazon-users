import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { AuthTokenService } from '../../../core/services/auth-token.service';
import { CartStore } from '../../../core/services/cart.store';
import { ProductCatalogStore } from '../../../core/services/product-catalog.store';
import { ProductsService } from '../../../core/services/products.service';
import { UserSessionStore } from '../../../core/services/user-session.store';
import { AmazCurrencyPipe } from '../../pipes/currency.pipe';
import { VendorBridgeService } from '../../../core/services/vendor-bridge.service';
import { WishlistStore } from '../../../core/services/wishlist.store';

@Component({
  selector: 'app-top-bar',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, AmazCurrencyPipe],
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
  navDrawerOpen = false;
  searchSuggestions: { id: string; titre: string; imagePrincipale: string; prix: number }[] = [];
  /** Amazon-style text rows: bold suffix after typed prefix. */
  keywordSuggestions: { text: string; boldLen: number }[] = [];
  private suggestionHideTimer: ReturnType<typeof setTimeout> | null = null;
  private suggestSeq = 0;

  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly isTouchLike =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly authToken: AuthTokenService,
    private readonly userSession: UserSessionStore,
    private readonly cart: CartStore,
    private readonly products: ProductCatalogStore,
    private readonly productsApi: ProductsService,
    private readonly vendorBridge: VendorBridgeService,
    readonly wishlistStore: WishlistStore
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

  /** Shown when the catalog has not loaded yet (matches PLP / seed taxonomy). */
  readonly categoryNavFallback = [
    'Électronique',
    'Mode',
    'Cuisine',
    'Informatique',
    'Maison',
    'Sports',
    'Beauté',
    'Jardin',
    'Auto',
    'Bébé',
    'Livres',
    'Animalerie',
    'Bricolage'
  ];

  /** Categories for the top-bar row: live from `ProductCatalogStore`, sorted (signal-safe). */
  readonly navCategories = computed(() => {
    const all = this.products.products();
    const set = new Set(
      all.map((p) => String(p.categorie || '').trim()).filter((c) => c.length > 0)
    );
    const fromCatalog = Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    return fromCatalog.length > 0 ? fromCatalog : [...this.categoryNavFallback];
  });

  onSearch(): void {
    const q = this.searchQuery.trim();
    this.showSuggestions = false;
    if (q) this.addToSearchHistory(q);
    this.router.navigate(['/produits'], {
      queryParams: { q: q.length ? q : null },
      queryParamsHandling: 'merge'
    });
  }

  onSearchInput(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.searchDebounceTimer = null;
      void this.updateSuggestions();
    }, 250);
  }

  private updateSuggestions(): void {
    void this.runSuggestionUpdate();
  }

  private commonPrefixLen(a: string, b: string): number {
    const n = Math.min(a.length, b.length);
    let i = 0;
    while (i < n && a[i].toLowerCase() === b[i].toLowerCase()) {
      i++;
    }
    return i;
  }

  private buildKeywordSuggestions(qRaw: string): void {
    const q = qRaw.trim();
    if (q.length < 1) {
      this.keywordSuggestions = [];
      return;
    }
    const qLower = q.toLowerCase();
    const seen = new Set<string>();
    const out: { text: string; boldLen: number }[] = [];

    const push = (raw: string) => {
      const text = raw.trim();
      if (!text || seen.has(text.toLowerCase())) {
        return;
      }
      if (!text.toLowerCase().startsWith(qLower)) {
        return;
      }
      seen.add(text.toLowerCase());
      out.push({ text, boldLen: this.commonPrefixLen(q, text) });
    };

    for (const c of this.navCategories()) {
      push(c);
    }
    for (const p of this.popularSearches) {
      push(p);
    }
    for (const h of this.searchHistory) {
      push(h);
    }
    for (const pr of this.products.products()) {
      push(pr.titre);
      if (seen.size >= 36) {
        break;
      }
    }

    out.sort((a, b) => a.text.length - b.text.length || a.text.localeCompare(b.text, 'fr'));
    this.keywordSuggestions = out.slice(0, 10);
  }

  private mapClientSuggestions(qLower: string) {
    const all = this.products.products();
    return all
      .filter(
        (p) =>
          p.titre.toLowerCase().includes(qLower) ||
          p.categorie.toLowerCase().includes(qLower) ||
          (p.descriptionCourte && p.descriptionCourte.toLowerCase().includes(qLower)) ||
          (p.descriptionDetaillee && p.descriptionDetaillee.toLowerCase().includes(qLower))
      )
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        titre: p.titre,
        imagePrincipale: p.imagePrincipale || '',
        prix: p.prix
      }));
  }

  private async runSuggestionUpdate(): Promise<void> {
    const qRaw = this.searchQuery.trim();
    const qLower = qRaw.toLowerCase();
    const seq = ++this.suggestSeq;

    if (qRaw.length < 2) {
      this.searchSuggestions = [];
      return;
    }

    try {
      const res = await firstValueFrom(this.productsApi.suggest(qRaw, 8));
      if (seq !== this.suggestSeq) {
        return;
      }
      const items = (res as { data?: { items?: unknown[] } })?.data?.items ?? [];
      const mapped = items
        .map((raw: unknown) => {
          const r = raw as Record<string, unknown>;
          return {
            id: String(r['id'] ?? ''),
            titre: String(r['titre'] ?? r['title'] ?? ''),
            imagePrincipale: String(r['imagePrincipale'] ?? r['image'] ?? ''),
            prix: Number(r['prix'] ?? r['price'] ?? 0)
          };
        })
        .filter((s) => s.id && s.titre);
      if (mapped.length > 0) {
        this.searchSuggestions = mapped;
        return;
      }
    } catch {
      if (seq !== this.suggestSeq) {
        return;
      }
    }

    if (seq !== this.suggestSeq) {
      return;
    }
    this.searchSuggestions = this.mapClientSuggestions(qLower);
  }

  applyPopularSearch(term: string): void {
    this.searchQuery = term;
    this.showSuggestions = false;
    this.addToSearchHistory(term);
    this.router.navigate(['/produits'], {
      queryParams: { q: term },
      queryParamsHandling: 'merge'
    });
  }

  applyHistorySearch(term: string): void {
    this.searchQuery = term;
    this.showSuggestions = false;
    this.router.navigate(['/produits'], {
      queryParams: { q: term },
      queryParamsHandling: 'merge'
    });
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

  applyKeywordSearch(term: string): void {
    if (this.suggestionHideTimer) {
      clearTimeout(this.suggestionHideTimer);
    }
    this.searchQuery = term;
    this.showSuggestions = false;
    this.addToSearchHistory(term);
    this.router.navigate(['/produits'], {
      queryParams: { q: term, page: null },
      queryParamsHandling: 'merge'
    });
  }

  toggleCategoriesMenu(): void {
    this.categoriesMenuOpen = !this.categoriesMenuOpen;
  }

  toggleNavDrawer(): void {
    this.navDrawerOpen = !this.navDrawerOpen;
  }

  closeNavDrawer(): void {
    this.navDrawerOpen = false;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth > 900) {
      this.navDrawerOpen = false;
    }
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

  async logout(): Promise<void> {
    this.accountOpen = false;
    await firstValueFrom(this.authService.logout()).catch(() => undefined);
    this.authToken.clearToken();
    this.userSession.clear();
    await this.router.navigateByUrl('/');
  }
}
