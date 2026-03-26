import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';

import { CartActionsService } from '../../core/services/cart-actions.service';
import { ProductCatalogStore } from '../../core/services/product-catalog.store';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

function parsePriceQuery(value: string | null): number | null {
  if (value == null || value === '') {
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return n;
}

function parsePageQuery(value: string | null): number {
  if (value == null || value === '') {
    return 1;
  }
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) {
    return 1;
  }
  return n;
}

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink, FormsModule, AmazCurrencyPipe],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products {
  constructor(
    private readonly productsStore: ProductCatalogStore,
    readonly cartActions: CartActionsService,
    private readonly router: Router,
    route: ActivatedRoute
  ) {
    route.queryParamMap.subscribe((params) => this.syncFromQueryParams(params));
  }

  get products() {
    return this.productsStore.products;
  }

  selectedCategory: string | null = null;
  searchTerm = '';
  sortBy: 'pertinence' | 'prix_asc' | 'prix_desc' | 'note' = 'pertinence';
  priceMin: number | null = null;
  priceMax: number | null = null;
  priceMinInput: number | null = null;
  priceMaxInput: number | null = null;
  categoryFilter: string | null = null;

  /** Client-side page size (catalog still fully loaded from API). */
  readonly pageSize = 12;

  /** Results page (1-based), synced from `?page=`. */
  currentPage = 1;

  /** Sidebar: first N category chips until expanded. */
  readonly filterCategoryPreviewCount = 5;

  filterCategoriesExpanded = false;

  get categories(): string[] {
    const all = this.products();
    const set = new Set(all.map((p) => p.categorie));
    return Array.from(set);
  }

  get categoriesSorted(): string[] {
    return [...this.categories].sort((a, b) => a.localeCompare(b, 'fr'));
  }

  get sidebarCategoriesVisible(): string[] {
    const all = this.categoriesSorted;
    if (this.filterCategoriesExpanded || all.length <= this.filterCategoryPreviewCount) {
      return all;
    }
    return all.slice(0, this.filterCategoryPreviewCount);
  }

  get sidebarCategoriesHasMore(): boolean {
    return this.categoriesSorted.length > this.filterCategoryPreviewCount;
  }

  /** Editorial empty-state chips when no products match filters (subset of seeded taxonomy). */
  readonly suggestedCategoriesFallback = [
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

  get suggestedCategoriesForEmpty(): string[] {
    const fromStore = this.categories;
    if (fromStore.length > 0) {
      return [...fromStore].sort((a, b) => a.localeCompare(b, 'fr')).slice(0, 8);
    }
    return this.suggestedCategoriesFallback;
  }

  private syncFromQueryParams(params: ParamMap): void {
    this.selectedCategory = params.get('categorie');
    this.categoryFilter = this.selectedCategory;
    this.searchTerm = params.get('q') ?? '';

    const minP = parsePriceQuery(params.get('minPrix'));
    const maxP = parsePriceQuery(params.get('maxPrix'));
    this.priceMin = minP;
    this.priceMax = maxP;
    this.priceMinInput = minP;
    this.priceMaxInput = maxP;
    this.currentPage = parsePageQuery(params.get('page'));
  }

  /** Active PLP filters as query params (omit unset keys). */
  private plQueryParams(pageOverride?: number): Record<string, string | undefined> {
    const q: Record<string, string | undefined> = {};
    const t = this.searchTerm.trim();
    if (t) {
      q['q'] = t;
    }
    if (this.selectedCategory) {
      q['categorie'] = this.selectedCategory;
    }
    if (this.priceMin != null) {
      q['minPrix'] = String(this.priceMin);
    }
    if (this.priceMax != null) {
      q['maxPrix'] = String(this.priceMax);
    }
    const page = pageOverride ?? this.currentPage;
    if (page > 1) {
      q['page'] = String(page);
    }
    return q;
  }

  private navigatePl(page?: number): void {
    const p = page ?? this.currentPage;
    this.router.navigate(['/produits'], { queryParams: this.plQueryParams(p) });
  }

  get filteredProducts() {
    let all = this.products();
    let result = all.filter((p) => (p.stock ?? 0) > 0);
    if (this.selectedCategory) {
      result = result.filter((p) => p.categorie === this.selectedCategory);
    }
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (p) =>
          p.titre.toLowerCase().includes(term) ||
          p.categorie.toLowerCase().includes(term) ||
          p.ville.toLowerCase().includes(term) ||
          (p.descriptionCourte && p.descriptionCourte.toLowerCase().includes(term)) ||
          (p.descriptionDetaillee && p.descriptionDetaillee.toLowerCase().includes(term))
      );
    }
    if (this.priceMin != null) {
      result = result.filter((p) => p.prix >= this.priceMin!);
    }
    if (this.priceMax != null) {
      result = result.filter((p) => p.prix <= this.priceMax!);
    }
    result = [...result];
    if (this.sortBy === 'prix_asc') {
      result.sort((a, b) => a.prix - b.prix);
    } else if (this.sortBy === 'prix_desc') {
      result.sort((a, b) => b.prix - a.prix);
    } else if (this.sortBy === 'note') {
      result.sort((a, b) => (b.note ?? 0) - (a.note ?? 0));
    }
    return result;
  }

  get totalFilteredCount(): number {
    return this.filteredProducts.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFilteredCount / this.pageSize));
  }

  get clampedPage(): number {
    return Math.min(Math.max(1, this.currentPage), this.totalPages);
  }

  get pagedProducts() {
    const page = this.clampedPage;
    const start = (page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  selectCategory(categorie: string | null): void {
    this.selectedCategory = categorie;
    this.categoryFilter = categorie;
    this.currentPage = 1;
    this.navigatePl(1);
  }

  applyFilters(): void {
    const minVal = this.priceMinInput != null ? Number(this.priceMinInput) : NaN;
    const maxVal = this.priceMaxInput != null ? Number(this.priceMaxInput) : NaN;

    let min = !Number.isNaN(minVal) && minVal >= 0 ? minVal : null;
    let max = !Number.isNaN(maxVal) && maxVal >= 0 ? maxVal : null;

    if (min != null && max != null && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    this.priceMin = min;
    this.priceMax = max;
    this.priceMinInput = min;
    this.priceMaxInput = max;

    this.selectedCategory = this.categoryFilter;
    this.currentPage = 1;
    this.navigatePl(1);
  }

  resetFilters(): void {
    this.priceMinInput = null;
    this.priceMaxInput = null;
    this.priceMin = null;
    this.priceMax = null;
    this.categoryFilter = null;
    this.selectedCategory = null;
    this.currentPage = 1;
    const t = this.searchTerm.trim();
    this.router.navigate(['/produits'], {
      queryParams: t ? { q: t } : {}
    });
  }

  onSortChange(value: 'pertinence' | 'prix_asc' | 'prix_desc' | 'note'): void {
    this.sortBy = value;
    this.currentPage = 1;
    this.navigatePl(1);
  }

  goToPage(page: number): void {
    const next = Math.min(Math.max(1, page), this.totalPages);
    this.currentPage = next;
    this.navigatePl(next);
  }

  toggleFilterCategories(): void {
    this.filterCategoriesExpanded = !this.filterCategoriesExpanded;
  }

  formatStars(note: number): string {
    const full = Math.floor(note);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }
}
