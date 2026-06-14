import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ServiceApiGateway } from './service-api-gateway';

export interface ReturnItem {
  productId: string;
  quantity: number;
}

export interface OrderReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  vendorId: string;
  userName: string;
  reason: string;
  qrReference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: ReturnItem[];
}

interface ReturnApiResponse {
  success?: boolean;
  data?: OrderReturnRequest;
  requestId?: string;
}

interface ReturnListResponse {
  success?: boolean;
  data?: OrderReturnRequest[];
}

@Injectable({ providedIn: 'root' })
export class ServiceRetourCommande {
  private cache: OrderReturnRequest[] = [];
  private loaded = false;

  constructor(private readonly gateway: ServiceApiGateway) {}

  async loadForUser(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.gateway.get<ReturnListResponse>('/retours')
      );
      this.cache = Array.isArray(res?.data) ? res.data : [];
    } catch {
      this.cache = [];
    }
    this.loaded = true;
  }

  async createReturnRequest(input: {
    orderId: string;
    items: { productId: string; quantity: number }[];
    reason: string;
  }): Promise<OrderReturnRequest> {
    const res = await firstValueFrom(
      this.gateway.post<ReturnApiResponse>('/retours', {
        orderId: input.orderId,
        reason: input.reason,
        items: input.items
      })
    );
    if (!res?.success || !res.data) {
      throw new Error('Création de la demande de retour impossible.');
    }
    const existing = this.cache.findIndex((r) => r.id === res.data!.id);
    if (existing >= 0) {
      this.cache[existing] = res.data;
    } else {
      this.cache.push(res.data);
    }
    return res.data;
  }

  hasReturnRequest(orderId: string): boolean {
    return this.cache.some((r) => r.orderId === orderId);
  }

  getReturnRequest(orderId: string): OrderReturnRequest | null {
    return this.cache.find((r) => r.orderId === orderId) ?? null;
  }

  qrImageUrl(request: OrderReturnRequest): string {
    const encoded = encodeURIComponent(request.qrReference || request.id);
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encoded}`;
  }

  get isLoaded(): boolean {
    return this.loaded;
  }
}
