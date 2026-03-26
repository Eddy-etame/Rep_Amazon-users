import { Injectable, effect, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { UserSessionStore } from './user-session.store';
import { WishlistService } from './wishlist.service';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  readonly itemCount = signal(0);
  /** Product ids currently in the user's wishlist (for UI). */
  readonly productIds = signal<ReadonlySet<string>>(new Set());
  readonly sharePath = signal<string | null>(null);
  readonly lastError = signal<string | null>(null);

  constructor(
    private readonly wishlist: WishlistService,
    private readonly userSession: UserSessionStore
  ) {
    effect(() => {
      const session = this.userSession.session();
      if (!session) {
        this.itemCount.set(0);
        this.productIds.set(new Set());
        this.sharePath.set(null);
        return;
      }
      void this.refresh();
    });
  }

  async refresh(): Promise<void> {
    if (!this.userSession.isLoggedIn()) {
      this.itemCount.set(0);
      this.productIds.set(new Set());
      return;
    }
    this.lastError.set(null);
    try {
      const res = await firstValueFrom(this.wishlist.getMine());
      const items = res.data?.items ?? [];
      this.applyItems(items);
      const token = res.data?.shareToken;
      this.sharePath.set(token ? `/liste/${token}` : null);
    } catch {
      this.lastError.set('Impossible de charger la liste de souhaits.');
      this.itemCount.set(0);
      this.productIds.set(new Set());
    }
  }

  hasProduct(productId: string): boolean {
    return this.productIds().has(String(productId));
  }

  private applyItems(items: { productId: string }[]): void {
    const ids = new Set(items.map((i) => String(i.productId)));
    this.productIds.set(ids);
    this.itemCount.set(ids.size);
  }

  async addProduct(productId: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(this.wishlist.addProduct(productId));
      const items = res.data?.items ?? [];
      this.applyItems(items);
      return true;
    } catch {
      this.lastError.set("Impossible d'ajouter le produit.");
      return false;
    }
  }

  async removeProduct(productId: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(this.wishlist.removeProduct(productId));
      const items = res.data?.items ?? [];
      this.applyItems(items);
      return true;
    } catch {
      return false;
    }
  }
}
