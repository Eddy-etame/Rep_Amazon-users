import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CartActionsService } from '../../core/services/cart-actions.service';
import { ProductsMockStore } from '../../core/services/products-mock.store';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products {
  constructor(
    private readonly productsStore: ProductsMockStore,
    readonly cartActions: CartActionsService,
    private readonly router: Router,
    route: ActivatedRoute
  ) {
    route.queryParamMap.subscribe((params) => {
      this.selectedCategory = params.get('categorie');
      this.searchTerm = params.get('q') ?? '';
    });
  }

  get products() {
    return this.productsStore.products;
  }

  selectedCategory: string | null = null;
  searchTerm = '';
  sortBy: 'pertinence' | 'prix_asc' | 'prix_desc' | 'note' = 'pertinence';
  priceMin: number | null = null;
  priceMax: number | null = null;

  get categories(): string[] {
    const all = this.products();
    const set = new Set(all.map((p) => p.categorie));
    return Array.from(set);
  }

  get filteredProducts() {
    let all = this.products();
    let result = all;
    if (this.selectedCategory) {
      result = result.filter((p) => p.categorie === this.selectedCategory);
    }
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (p) =>
          p.titre.toLowerCase().includes(term) ||
          p.categorie.toLowerCase().includes(term) ||
          p.ville.toLowerCase().includes(term)
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

  selectCategory(categorie: string | null): void {
    this.selectedCategory = categorie;
    this.router.navigate(['/produits'], {
      queryParams: {
        categorie: categorie ?? undefined,
        q: this.searchTerm || undefined
      }
    });
  }

  formatStars(note: number): string {
    const full = Math.floor(note);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }
}

