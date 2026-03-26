import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import type { CatalogProduct } from '../../core/services/product-catalog.store';
import { ProductCatalogStore } from '../../core/services/product-catalog.store';
import { ShareService } from '../../core/services/share.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-shared-wishlist-page',
  imports: [CommonModule, RouterLink, AmazCurrencyPipe],
  templateUrl: './shared-wishlist-page.html',
  styleUrl: './shared-wishlist-page.scss'
})
export class SharedWishlistPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly rows = signal<{ product: CatalogProduct; productId: string }[]>([]);
  listName = 'Liste de souhaits';
  loading = true;
  error = '';
  private token = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly wishlist: WishlistService,
    private readonly products: ProductCatalogStore,
    private readonly shareService: ShareService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const t = params.get('token')?.trim() ?? '';
      this.token = t;
      void this.loadShared(t);
    });
  }

  private async loadShared(token: string): Promise<void> {
    this.loading = true;
    this.error = '';
    this.rows.set([]);
    if (!token) {
      this.error = 'Lien de liste invalide.';
      this.loading = false;
      return;
    }
    try {
      const res = await firstValueFrom(this.wishlist.getSharedByToken(token));
      const ids = res.data?.productIds ?? [];
      if (res.data?.name) this.listName = res.data.name;
      const resolved: { product: CatalogProduct; productId: string }[] = [];
      for (const pid of ids) {
        const id = String(pid);
        let p = this.products.byId(id) ?? (await this.products.loadProduct(id));
        if (p) {
          resolved.push({ product: p, productId: id });
        }
      }
      this.rows.set(resolved);
    } catch {
      this.error = 'Liste introuvable ou lien expiré.';
    } finally {
      this.loading = false;
    }
  }

  async shareThisList(): Promise<void> {
    if (!this.token) return;
    const url = this.shareService.absoluteUrl(`/liste/${this.token}`);
    await this.shareService.shareOrCopy({
      title: this.listName,
      text: 'Liste de souhaits partagée sur Amaz',
      url
    });
  }
}
