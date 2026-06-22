// Source de vérité du PANIER (état client). Utilise les signals Angular + localStorage : le panier
// survit au rechargement et n'a PAS de micro-service back dédié (cf. cahier des charges).
import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { DepotCatalogueProduits, type CatalogProduct } from './depot-catalogue-produits';

const CART_STORAGE_KEY = 'amaz_cart_v1';

export interface CartItem {
  productId: string;
  titre: string;
  prixUnitaire: number;
  quantite: number;
  imagePrincipale: string;
  vendorId?: string;
  nomVendeur?: string;
}

@Injectable({ providedIn: 'root' })
export class DepotPanier {
  private readonly catalog = inject(DepotCatalogueProduits);

  private readonly itemsSignal = signal<CartItem[]>([]);

  readonly items = this.itemsSignal.asReadonly();

  constructor() {
    const restored = this.readFromStorage();
    if (restored.length > 0) {
      this.itemsSignal.set(restored);
    }

    effect(() => {
      const products = this.catalog.products();
      if (products.length === 0) {
        return;
      }
      const productById = new Map(products.map((p) => [p.id, p]));
      const current = this.items();
      const next = current.flatMap((item) => {
        const product = productById.get(item.productId);
        if (!product) {
          return [];
        }
        return [
          {
            ...item,
            titre: product.titre || item.titre,
            prixUnitaire: product.prix,
            imagePrincipale: product.imagePrincipale || item.imagePrincipale,
            vendorId: product.vendorId,
            nomVendeur: product.nomVendeur
          }
        ];
      });
      const changed =
        next.length !== current.length ||
        next.some((item, index) => {
          const prev = current[index];
          return (
            !prev ||
            prev.titre !== item.titre ||
            prev.prixUnitaire !== item.prixUnitaire ||
            prev.imagePrincipale !== item.imagePrincipale ||
            prev.vendorId !== item.vendorId ||
            prev.nomVendeur !== item.nomVendeur
          );
        });
      if (changed) {
        this.itemsSignal.set(next);
        this.persistToStorage();
      }
    });
  }

  private readFromStorage(): CartItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter(
          (row): row is CartItem =>
            !!row &&
            typeof row === 'object' &&
            typeof (row as CartItem).productId === 'string' &&
            typeof (row as CartItem).titre === 'string' &&
            typeof (row as CartItem).prixUnitaire === 'number' &&
            typeof (row as CartItem).quantite === 'number'
        )
        .map((row) => ({
          productId: row.productId,
          titre: row.titre,
          prixUnitaire: row.prixUnitaire,
          quantite: Math.max(1, Math.floor(Number(row.quantite))),
          imagePrincipale: String(row.imagePrincipale ?? ''),
          vendorId: row.vendorId,
          nomVendeur: row.nomVendeur
        }));
    } catch {
      return [];
    }
  }

  private persistToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items()));
    } catch {
      // quota / mode privé
    }
  }

  readonly totalQuantity = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantite, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.prixUnitaire * item.quantite, 0)
  );

  addItem(product: CatalogProduct): void {
    const current = this.items();
    const existing = current.find((i) => i.productId === product.id);
    if (existing) {
      this.itemsSignal.set(
        current.map((i) =>
          i.productId === product.id ? { ...i, quantite: i.quantite + 1 } : i
        )
      );
      this.persistToStorage();
      return;
    }
    this.itemsSignal.set([
      ...current,
      {
        productId: product.id,
        titre: product.titre,
        prixUnitaire: product.prix,
        quantite: 1,
        imagePrincipale: product.imagePrincipale,
        vendorId: product.vendorId,
        nomVendeur: product.nomVendeur
      }
    ]);
    this.persistToStorage();
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
    this.persistToStorage();
  }

  removeItem(productId: string): void {
    this.itemsSignal.set(this.items().filter((item) => item.productId !== productId));
    this.persistToStorage();
  }

  clear(): void {
    this.itemsSignal.set([]);
    this.persistToStorage();
  }
}
