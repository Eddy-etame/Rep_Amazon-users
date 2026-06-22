// Source de vérité des FAVORIS (liste de souhaits) côté client. Synchronisée avec le product-service
// (routes /wishlists) via service-favoris.
import { Injectable, effect, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DepotSessionUtilisateur } from './depot-session-utilisateur';
import { ServiceFavoris } from './service-favoris';

@Injectable({ providedIn: 'root' })
export class DepotFavoris {
  readonly itemCount = signal(0);
  /** Identifiants produit actuellement dans la liste de souhaits (pour l'UI). */
  readonly productIds = signal<ReadonlySet<string>>(new Set());
  readonly sharePath = signal<string | null>(null);
  readonly lastError = signal<string | null>(null);

  constructor(
    private readonly wishlist: ServiceFavoris,
    private readonly userSession: DepotSessionUtilisateur
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
