import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { GatewayApiService } from './gateway-api.service';

export interface OrderCreateItem {
  productId: string;
  quantity: number;
}

export interface OrderCreatePayload {
  items?: OrderCreateItem[];
  articles?: OrderCreateItem[];
  adresseLivraison?: unknown;
  methodePaiement?: string;
}

export interface OrderQuery {
  statut?: string;
  utilisateurId?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private readonly gateway: GatewayApiService) {}

  create(payload: OrderCreatePayload) {
    return this.gateway.post('/commandes', payload);
  }

  list(query: OrderQuery = {}) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return this.gateway.get('/commandes', { params });
  }

  getById(orderId: string) {
    return this.gateway.get(`/commandes/${encodeURIComponent(orderId)}`);
  }

  cancel(orderId: string) {
    return this.gateway.put(`/commandes/${encodeURIComponent(orderId)}/annuler`, {});
  }
}
