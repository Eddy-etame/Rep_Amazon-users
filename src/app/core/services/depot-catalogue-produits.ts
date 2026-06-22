// Source de vérité du CATALOGUE côté client : garde les produits chargés depuis le product-service
// et expose des signals (liste, recherche, byId) consommés par les composants.
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ServiceProduits, type ProductSearchQuery } from './service-produits';

function formatCatalogLoadError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Catalogue temporairement indisponible. Vérifiez votre connexion et réessayez.';
    }
    if (err.status === 403) {
      return 'Accès au catalogue refusé.';
    }
    return `Erreur serveur (HTTP ${err.status}). Réessayez.`;
  }
  return 'Erreur inconnue lors du chargement du catalogue.';
}

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
  /** Nom d'affichage du vendeur (messagerie / fiche). */
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

/** Les lignes de seed anciennes peuvent encore être en centimes ; convertir une fois pour l'affichage. */
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
export class DepotCatalogueProduits {
  private readonly productsSignal = signal<CatalogProduct[]>([]);
  readonly products = this.productsSignal.asReadonly();

  private readonly catalogLoadErrorSignal = signal<string | null>(null);
  /** Défini quand le dernier `load()` a échoué ; effacé quand un chargement réussit. */
  readonly catalogLoadError = this.catalogLoadErrorSignal.asReadonly();

  constructor(private readonly productsService: ServiceProduits) {
    void this.load();
  }

  async load(query: ProductSearchQuery = {}): Promise<void> {
    const pageSize = 250;
    const aggregated: CatalogProduct[] = [];
    const seen = new Set<string>();

    this.catalogLoadErrorSignal.set(null);

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
      this.catalogLoadErrorSignal.set(null);
    } catch (err) {
      console.warn('[DepotCatalogueProduits] load failed, using empty catalog:', err);
      this.catalogLoadErrorSignal.set(formatCatalogLoadError(err));
      this.productsSignal.set([]);
    }
  }

  /**
   * Récupère les lignes pour la requête PLP courante et les fusionne dans le catalogue (par id).
   * Ne remplace pas le store — préserve la résolution panier / PDP tout en s'alignant sur les filtres API.
   */
  async mergeFromListQuery(query: ProductSearchQuery): Promise<void> {
    const qText = String(query.q || query.titre || '').trim();
    const cat = String(query.categorie || '').trim();
    const hasPrice = query.prixMin != null || query.prixMax != null;
    if (!qText && !cat && !hasPrice) {
      return;
    }

    const pageSize = 250;
    try {
      let page = 1;
      const seen = new Set<string>();
      const batch: CatalogProduct[] = [];

      while (page <= 5) {
        const response = await firstValueFrom(
          this.productsService.search({
            limit: pageSize,
            page,
            ...(qText ? { q: qText } : {}),
            ...(cat ? { categorie: cat } : {}),
            ...(query.prixMin != null ? { prixMin: query.prixMin } : {}),
            ...(query.prixMax != null ? { prixMax: query.prixMax } : {})
          })
        );

        const data = (response as ProductsSearchResponse).data;
        const rawItems = data?.items ?? [];
        for (const item of rawItems) {
          const p = this.normalizeProduct(item);
          if (!p.id || seen.has(p.id)) continue;
          seen.add(p.id);
          batch.push(p);
        }

        if (rawItems.length === 0 || rawItems.length < pageSize) {
          break;
        }
        page += 1;
      }

      if (batch.length === 0) {
        return;
      }

      this.productsSignal.update((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        for (const p of batch) {
          map.set(p.id, p);
        }
        return Array.from(map.values());
      });
    } catch (err) {
      console.warn('[DepotCatalogueProduits] mergeFromListQuery failed:', err);
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
