import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

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
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  search(query: ProductSearchQuery) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get(`${this.baseUrl}/produits`, { params });
  }

  getById(productId: string) {
    return this.http.get(`${this.baseUrl}/produits/${productId}`);
  }
}
