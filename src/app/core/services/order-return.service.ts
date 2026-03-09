import { Injectable } from '@angular/core';

const STORAGE_KEY = 'amaz_return_requests';

export interface OrderReturnRequest {
  requestId: string;
  orderId: string;
  itemIds: string[];
  reason: string;
  qrData: string;
  qrImageUrl: string;
  createdAt: number;
  status: 'pending' | 'processing' | 'completed';
}

@Injectable({ providedIn: 'root' })
export class OrderReturnService {
  createReturnRequest(input: {
    orderId: string;
    itemIds: string[];
    reason: string;
  }): OrderReturnRequest | null {
    const requests = this.getRequests();
    const existing = requests.find((r) => r.orderId === input.orderId);
    if (existing) {
      return existing;
    }

    const requestId = this.buildRequestId(input.orderId);
    const payload = JSON.stringify({
      requestId,
      orderId: input.orderId,
      itemIds: input.itemIds,
      ts: Date.now()
    });
    const encoded = encodeURIComponent(payload);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encoded}`;

    const request: OrderReturnRequest = {
      requestId,
      orderId: input.orderId,
      itemIds: input.itemIds,
      reason: input.reason.trim(),
      qrData: payload,
      qrImageUrl,
      createdAt: Date.now(),
      status: 'pending'
    };

    requests.push(request);
    this.saveRequests(requests);
    return request;
  }

  hasReturnRequest(orderId: string): boolean {
    return this.getRequests().some((r) => r.orderId === orderId);
  }

  getReturnRequest(orderId: string): OrderReturnRequest | null {
    return this.getRequests().find((r) => r.orderId === orderId) ?? null;
  }

  private getRequests(): OrderReturnRequest[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];

      // Backward compatibility with old storage format: string[] orderIds.
      if (parsed.every((v) => typeof v === 'string')) {
        return (parsed as string[]).map((orderId) => {
          const requestId = this.buildRequestId(orderId);
          const payload = JSON.stringify({
            requestId,
            orderId,
            itemIds: [],
            ts: Date.now()
          });
          return {
            requestId,
            orderId,
            itemIds: [],
            reason: 'Demande créée sur ancienne version',
            qrData: payload,
            qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(payload)}`,
            createdAt: Date.now(),
            status: 'pending' as const
          };
        });
      }

      return parsed as OrderReturnRequest[];
    } catch {
      return [];
    }
  }

  private saveRequests(requests: OrderReturnRequest[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }

  private buildRequestId(orderId: string): string {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `RET-${orderId.toUpperCase()}-${suffix}`;
  }
}
