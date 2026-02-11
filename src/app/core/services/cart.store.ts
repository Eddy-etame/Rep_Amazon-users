import { Injectable, computed, signal } from '@angular/core';

import { ProductMock } from './products-mock.store';

export interface CartItem {
  productId: string;
  titre: string;
  prixUnitaire: number;
  quantite: number;
  imagePrincipale: string;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly itemsSignal = signal<CartItem[]>([]);

  readonly items = this.itemsSignal.asReadonly();

  readonly totalQuantity = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantite, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.prixUnitaire * item.quantite, 0)
  );

  addItem(product: ProductMock): void {
    const current = this.items();
    const existing = current.find((i) => i.productId === product.id);
    if (existing) {
      this.itemsSignal.set(
        current.map((i) =>
          i.productId === product.id ? { ...i, quantite: i.quantite + 1 } : i
        )
      );
      return;
    }
    this.itemsSignal.set([
      ...current,
      {
        productId: product.id,
        titre: product.titre,
        prixUnitaire: product.prix,
        quantite: 1,
        imagePrincipale: product.imagePrincipale
      }
    ]);
  }

  updateQuantity(productId: string, quantite: number): void {
    if (quantite <= 0) {
      this.removeItem(productId);
      return;
    }
    this.itemsSignal.set(
      this.items().map((item) =>
        item.productId === productId ? { ...item, quantite } : item
      )
    );
  }

  removeItem(productId: string): void {
    this.itemsSignal.set(this.items().filter((item) => item.productId !== productId));
  }

  clear(): void {
    this.itemsSignal.set([]);
  }
}

