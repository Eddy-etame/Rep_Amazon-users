import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { ServiceActionsPanier } from '../../core/services/service-actions-panier';
import { DepotCatalogueProduits, type CatalogProduct } from '../../core/services/depot-catalogue-produits';
import { PipeDeviseAmaz } from '../../shared/pipes/pipe-devise';

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
  selector: 'app-produits',
  imports: [CommonModule, RouterLink, FormsModule, PipeDeviseAmaz],
  templateUrl: './produits.html',
  styleUrl: './produits.scss'
})
export class Produits implements OnDestroy {
  private readonly plpQuerySub: Subscription;

  constructor(
    readonly productsStore: DepotCatalogueProduits,
    readonly cartActions: ServiceActionsPanier,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.syncFromQueryParams(this.route.snapshot.queryParamMap);
    this.plpQuerySub = this.route.queryParamMap
      .pipe(
        debounceTime(250),
        map((p) =>
          [p.get('q') ?? '', p.get('categorie') ?? '', p.get('minPrix') ?? '', p.get('maxPrix') ?? ''].join('\u0001')
        ),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.syncFromQueryParams(this.route.snapshot.queryParamMap);
        void this.productsStore.mergeFromListQuery({
          q: this.searchTerm.trim() || undefined,
          categorie: this.selectedCategory?.trim() || undefined,
          prixMin: this.priceMin ?? undefined,
          prixMax: this.priceMax ?? undefined
        });
      });
  }

  ngOnDestroy(): void {
    this.plpQuerySub.unsubscribe();
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

  readonly pageSize = 12;
  currentPage = 1;
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

  private relevanceScore(product: CatalogProduct, termLower: string): number {
    if (!termLower) return 0;
    const title = product.titre.toLowerCase();
    const cat = product.categorie.toLowerCase();
    const city = product.ville.toLowerCase();
    const shortD = (product.descriptionCourte || '').toLowerCase();
    const longD = (product.descriptionDetaillee || '').toLowerCase();
    if (title === termLower) return 100;
    if (title.startsWith(termLower)) return 85;
    if (title.includes(termLower)) return 70;
    if (cat.includes(termLower)) return 55;
    if (city.includes(termLower)) return 45;
    if (shortD.includes(termLower)) return 30;
    if (longD.includes(termLower)) return 18;
    return 0;
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
    } else if (this.sortBy === 'pertinence') {
      if (term) {
        result.sort((a, b) => {
          const diff = this.relevanceScore(b, term) - this.relevanceScore(a, term);
          if (diff !== 0) return diff;
          return a.titre.localeCompare(b.titre, 'fr');
        });
      } else {
        result.sort((a, b) => b.createdAt - a.createdAt);
      }
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

  clearAllFilters(): void {
    this.router.navigate(['/produits']);
  }

  private plQueryParamsOmitting(omit: 'q' | 'categorie' | 'minPrix' | 'maxPrix'): Record<string, string | undefined> {
    const base = this.plQueryParams(1);
    if (omit === 'q') delete base['q'];
    if (omit === 'categorie') delete base['categorie'];
    if (omit === 'minPrix') delete base['minPrix'];
    if (omit === 'maxPrix') delete base['maxPrix'];
    return base;
  }

  removeSearchChip(): void {
    this.router.navigate(['/produits'], { queryParams: this.plQueryParamsOmitting('q') });
  }

  removeCategoryChip(): void {
    this.router.navigate(['/produits'], { queryParams: this.plQueryParamsOmitting('categorie') });
  }

  removeMinPriceChip(): void {
    this.router.navigate(['/produits'], { queryParams: this.plQueryParamsOmitting('minPrix') });
  }

  removeMaxPriceChip(): void {
    this.router.navigate(['/produits'], { queryParams: this.plQueryParamsOmitting('maxPrix') });
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

  readonly productImagePlaceholder = '/product-placeholder.svg';

  productCardImageSrc(url: string | undefined): string {
    const u = String(url || '').trim();
    if (!u) {
      return this.productImagePlaceholder;
    }
    const lower = u.toLowerCase();
    if (lower.includes('bing.com') || lower.includes('bing.net')) {
      return this.productImagePlaceholder;
    }
    return u;
  }

  onProductImageError(event: Event): void {
    const el = event.target as HTMLImageElement;
    if (!el || el.dataset['fallback'] === '1') {
      return;
    }
    el.dataset['fallback'] = '1';
    el.src = this.productImagePlaceholder;
  }
}
