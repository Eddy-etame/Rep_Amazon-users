import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { GatewayApiService } from './gateway-api.service';

export interface ProductSearchQuery {
  titre?: string;
  prixMin?: number;
  prixMax?: number;
  categorie?: string;
  ville?: string;
  page?: number;
  limit?: number;
  tri?: 'prix' | 'date';
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private readonly gateway: GatewayApiService) {}

  search(query: ProductSearchQuery) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return this.gateway.get('/produits', { params });
  }

  getById(productId: string) {
    return this.gateway.get(`/produits/${encodeURIComponent(productId)}`);
  }

  suggest(q: string, limit = 8) {
    let params = new HttpParams().set('q', q).set('limit', String(limit));
    return this.gateway.get('/produits/suggest', { params });
  }
}
