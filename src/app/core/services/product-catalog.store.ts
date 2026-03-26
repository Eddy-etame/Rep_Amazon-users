import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ProductsService, type ProductSearchQuery } from './products.service';

export interface CatalogProduct {
  id: string;
  titre: string;
  categorie: string;
  ville: string;
  prix: number;
  descriptionCourte: string;
  descriptionDetaillee: string;
  imagePrincipale: string;
  galerie: string[];
  createdAt: number;
  note?: number;
  nbAvis?: number;
  prixBarre?: number | null;
  livraisonGratuite?: boolean;
  vendorId?: string;
  /** Display name of the seller (messagerie / fiche). */
  nomVendeur?: string;
  sku?: string;
  stock?: number;
  lowStockThreshold?: number;
  status?: string;
}

interface ProductsSearchResponse {
  success?: boolean;
  data?: {
    items?: unknown[];
    pagination?: { page?: number; limit?: number; total?: number };
  };
}

interface ProductDetailResponse {
  success?: boolean;
  data?: unknown;
}

function toTimestamp(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function summarizeDescription(description: string): string {
  const clean = description.trim();
  if (!clean) return '';
  const sentences = clean.split(/(?<=[.!?])\s+/);
  return sentences[0] || clean;
}

/** Legacy seed rows may still be in centimes in old DBs; convert once for display. */
function normalizeEuroPriceFromApi(productId: string, value: unknown): number {
  let p = toNumber(value);
  if (
    productId.startsWith('prd_seed_') &&
    p >= 1000 &&
    Number.isFinite(p) &&
    Math.abs(p - Math.round(p)) < Number.EPSILON
  ) {
    p = Math.round(p) / 100;
  }
  return Math.round(p * 100) / 100;
}

@Injectable({ providedIn: 'root' })
export class ProductCatalogStore {
  private readonly productsSignal = signal<CatalogProduct[]>([]);
  readonly products = this.productsSignal.asReadonly();

  constructor(private readonly productsService: ProductsService) {
    void this.load();
  }

  async load(query: ProductSearchQuery = {}): Promise<void> {
    const pageSize = 250;
    const aggregated: CatalogProduct[] = [];
    const seen = new Set<string>();

    try {
      let page = 1;
      let total: number | null = null;

      while (true) {
        const response = await firstValueFrom(
          this.productsService.search({
            limit: pageSize,
            page,
            ...query
          })
        );

        const data = (response as ProductsSearchResponse).data;
        const rawItems = data?.items ?? [];
        const paging = data?.pagination;
        if (paging?.total != null && Number.isFinite(Number(paging.total))) {
          total = Number(paging.total);
        }

        for (const item of rawItems) {
          const p = this.normalizeProduct(item);
          if (!p.id || seen.has(p.id)) {
            continue;
          }
          seen.add(p.id);
          aggregated.push(p);
        }

        if (rawItems.length === 0) {
          break;
        }
        if (rawItems.length < pageSize) {
          break;
        }
        if (total != null && aggregated.length >= total) {
          break;
        }
        page += 1;
        if (page > 40) {
          break;
        }
      }

      this.productsSignal.set(aggregated);
    } catch (err) {
      console.warn('[ProductCatalogStore] load failed, using empty catalog:', err);
      this.productsSignal.set([]);
    }
  }

  async loadProduct(productId: string): Promise<CatalogProduct | undefined> {
    const existing = this.byId(productId);
    if (existing) {
      return existing;
    }

    const response = await firstValueFrom(this.productsService.getById(productId));
    const raw = (response as ProductDetailResponse).data;
    if (!raw) {
      return undefined;
    }

    const normalized = this.normalizeProduct(raw);
    this.productsSignal.update((products) => {
      const withoutCurrent = products.filter((product) => product.id !== normalized.id);
      return [normalized, ...withoutCurrent];
    });
    return normalized;
  }

  byId(id: string): CatalogProduct | undefined {
    return this.products().find((product) => product.id === id);
  }

  byCategorie(categorie: string): CatalogProduct[] {
    return this.products().filter((product) => product.categorie === categorie);
  }

  private normalizeProduct(raw: any): CatalogProduct {
    const id = String(raw?.id || '');
    const title = String(raw?.titre || raw?.title || '').trim();
    const fullDescription = String(
      raw?.descriptionDetaillee || raw?.detailedDescription || raw?.description || ''
    ).trim();
    const shortDescription = String(
      raw?.descriptionCourte || raw?.shortDescription || summarizeDescription(fullDescription)
    ).trim();

    const prixBarreRaw =
      raw?.prixBarre === null || raw?.strikethroughPrice === null
        ? null
        : raw?.prixBarre !== undefined || raw?.strikethroughPrice !== undefined
          ? normalizeEuroPriceFromApi(id, raw?.prixBarre ?? raw?.strikethroughPrice)
          : null;

    return {
      id,
      titre: title,
      categorie: String(raw?.categorie || raw?.category || 'Général'),
      ville: String(raw?.ville || raw?.city || ''),
      prix: normalizeEuroPriceFromApi(id, raw?.prix ?? raw?.price),
      descriptionCourte: shortDescription,
      descriptionDetaillee: fullDescription || shortDescription,
      imagePrincipale: String(raw?.imagePrincipale || raw?.image || ''),
      galerie: Array.isArray(raw?.galerie)
        ? raw.galerie.filter(Boolean)
        : Array.isArray(raw?.gallery)
          ? raw.gallery.filter(Boolean)
          : [],
      createdAt: toTimestamp(raw?.createdAt),
      note:
        raw?.note !== undefined || raw?.rating !== undefined
          ? toNumber(raw?.note ?? raw?.rating)
          : undefined,
      nbAvis:
        raw?.nbAvis !== undefined || raw?.reviewCount !== undefined
          ? toNumber(raw?.nbAvis ?? raw?.reviewCount)
          : undefined,
      prixBarre: prixBarreRaw,
      livraisonGratuite: Boolean(raw?.livraisonGratuite ?? raw?.freeShipping),
      vendorId: raw?.vendorId ? String(raw.vendorId) : undefined,
      nomVendeur: String(raw?.nomVendeur || raw?.vendorName || '').trim() || undefined,
      sku: raw?.sku ? String(raw.sku) : undefined,
      stock: raw?.stock !== undefined ? toNumber(raw.stock, 0) : undefined,
      lowStockThreshold:
        raw?.lowStockThreshold !== undefined ? toNumber(raw.lowStockThreshold, 5) : undefined,
      status: raw?.status ? String(raw.status) : undefined
    };
  }
}
