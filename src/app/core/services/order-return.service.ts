import { Injectable } from '@angular/core';

const STORAGE_KEY = 'amaz_return_requests';

@Injectable({ providedIn: 'root' })
export class OrderReturnService {
  requestReturn(orderId: string): void {
    const ids = this.getIds();
    if (!ids.includes(orderId)) {
      ids.push(orderId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  }

  hasReturnRequest(orderId: string): boolean {
    return this.getIds().includes(orderId);
  }

  private getIds(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }
}
