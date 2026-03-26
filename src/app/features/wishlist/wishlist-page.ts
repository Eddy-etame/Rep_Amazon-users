import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import type { CatalogProduct } from '../../core/services/product-catalog.store';
import { ProductCatalogStore } from '../../core/services/product-catalog.store';
import { ShareService } from '../../core/services/share.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { WishlistStore } from '../../core/services/wishlist.store';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-wishlist-page',
  imports: [CommonModule, RouterLink, AmazCurrencyPipe],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.scss'
})
export class WishlistPage implements OnInit {
  readonly rows = signal<{ product: CatalogProduct; productId: string }[]>([]);
  loading = true;
  shareHint = '';
  listName = 'Ma liste';
  shareDisabled = false;

  constructor(
    private readonly wishlist: WishlistService,
    private readonly wishlistStore: WishlistStore,
    private readonly products: ProductCatalogStore,
    private readonly shareService: ShareService,
    private readonly toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      const res = await firstValueFrom(this.wishlist.getMine());
      const items = res.data?.items ?? [];
      if (res.data?.name) this.listName = res.data.name;
      this.shareDisabled = Boolean(res.data?.shareDisabled);
      const resolved: { product: CatalogProduct; productId: string }[] = [];
      for (const it of items) {
        const pid = String(it.productId);
        let p = this.products.byId(pid) ?? (await this.products.loadProduct(pid));
        if (p) {
          resolved.push({ product: p, productId: pid });
        }
      }
      this.rows.set(resolved);
    } catch {
      this.rows.set([]);
    } finally {
      this.loading = false;
    }
  }

  async remove(productId: string): Promise<void> {
    await this.wishlistStore.removeProduct(productId);
    this.rows.update((r) => r.filter((x) => x.productId !== productId));
  }

  async copyShareLink(): Promise<void> {
    this.shareHint = '';
    if (this.shareDisabled) {
      this.toast.show('Réactivez le lien de partage avant de copier.', 'info');
      return;
    }
    try {
      const res = await firstValueFrom(this.wishlist.ensureShareLink(false));
      const path = res.data?.sharePath || (res.data?.shareToken ? `/liste/${res.data.shareToken}` : '');
      if (!path) {
        this.toast.show('Impossible de générer le lien.', 'error');
        return;
      }
      const url = this.shareService.absoluteUrl(path);
      await this.shareService.shareOrCopy({
        title: this.listName,
        text: 'Ma liste de souhaits Amaz',
        url
      });
      const msg = this.shareService.getMessage() || 'Lien prêt à partager.';
      this.shareService.clearMessage();
      this.shareHint = msg;
      this.toast.show(msg, 'success');
    } catch {
      this.toast.show('Erreur lors du partage.', 'error');
    }
    setTimeout(() => (this.shareHint = ''), 5000);
  }

  async toggleShareDisabled(disable: boolean): Promise<void> {
    if (disable && !globalThis.confirm('Désactiver le lien public ? Les personnes avec l’ancien lien ne verront plus la liste.')) {
      return;
    }
    try {
      await firstValueFrom(this.wishlist.setShareDisabled(disable));
      this.shareDisabled = disable;
      void this.wishlistStore.refresh();
      this.toast.show(
        disable ? 'Lien de partage désactivé.' : 'Lien de partage réactivé.',
        'success'
      );
    } catch {
      this.toast.show('Impossible de mettre à jour le partage.', 'error');
    }
  }
}
