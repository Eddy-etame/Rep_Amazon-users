import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface OrderCreatePayload {
  produitId: string;
  quantite: number;
}

export interface OrderQuery {
  statut?: string;
  utilisateurId?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  create(payload: OrderCreatePayload) {
    return this.http.post(`${this.baseUrl}/commandes`, payload);
  }

  list(query: OrderQuery = {}) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get(`${this.baseUrl}/commandes`, { params });
  }

  cancel(orderId: string) {
    return this.http.put(`${this.baseUrl}/commandes/${orderId}/annuler`, {});
  }
}
