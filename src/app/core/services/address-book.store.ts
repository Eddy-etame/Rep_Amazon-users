import { Injectable, effect, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { GatewayApiService } from './gateway-api.service';
import { UserSessionStore } from './user-session.store';

export interface DeliveryAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface AddressListResponse {
  success?: boolean;
  data?: {
    items?: DeliveryAddress[];
  };
}

interface AddressItemResponse {
  success?: boolean;
  data?: DeliveryAddress;
}

@Injectable({ providedIn: 'root' })
export class AddressBookStore {
  private readonly addressesSignal = signal<DeliveryAddress[]>([]);
  private loadedForUserId: string | null = null;

  readonly addresses = this.addressesSignal.asReadonly();

  constructor(
    private readonly gateway: GatewayApiService,
    private readonly userSession: UserSessionStore
  ) {
    effect(() => {
      const session = this.userSession.session();
      const userId = session?.id || null;
      if (!userId) {
        this.loadedForUserId = null;
        this.addressesSignal.set([]);
        return;
      }
      if (this.loadedForUserId !== userId) {
        this.loadedForUserId = userId;
        void this.load();
      }
    });
  }

  async load(): Promise<void> {
    const response = await firstValueFrom(this.gateway.get<AddressListResponse>('/addresses'));
    this.addressesSignal.set(response.data?.items || []);
  }

  getAddresses(): DeliveryAddress[] {
    return this.addresses();
  }

  hasAddresses(): boolean {
    return this.addresses().length > 0;
  }

  getDefault(): DeliveryAddress | undefined {
    return this.addresses().find((address) => address.isDefault) ?? this.addresses()[0];
  }

  getById(id: string): DeliveryAddress | undefined {
    return this.addresses().find((address) => address.id === id);
  }

  async addAddress(address: Omit<DeliveryAddress, 'id' | 'isDefault'>): Promise<void> {
    const response = await firstValueFrom(
      this.gateway.post<AddressItemResponse>('/addresses', address)
    );

    const created = response.data;
    if (!created) {
      return;
    }

    this.addressesSignal.update((addresses) => {
      const next = created.isDefault
        ? addresses.map((item) => ({ ...item, isDefault: false }))
        : [...addresses];
      return [...next, created];
    });
  }

  async updateAddress(
    id: string,
    partial: Partial<Omit<DeliveryAddress, 'id'>>
  ): Promise<void> {
    const current = this.getById(id);
    if (!current) {
      return;
    }

    const response = await firstValueFrom(
      this.gateway.put<AddressItemResponse>(`/addresses/${encodeURIComponent(id)}`, {
        ...current,
        ...partial
      })
    );

    const updated = response.data;
    if (!updated) {
      return;
    }

    this.addressesSignal.update((addresses) =>
      addresses.map((address) => {
        if (address.id === id) {
          return updated;
        }
        if (updated.isDefault) {
          return { ...address, isDefault: false };
        }
        return address;
      })
    );
  }

  async deleteAddress(id: string): Promise<void> {
    await firstValueFrom(this.gateway.delete(`/addresses/${encodeURIComponent(id)}`));
    await this.load();
  }

  async setDefault(id: string): Promise<void> {
    const response = await firstValueFrom(
      this.gateway.put<AddressItemResponse>(`/addresses/${encodeURIComponent(id)}/default`, {})
    );

    const updated = response.data;
    if (!updated) {
      return;
    }

    this.addressesSignal.update((addresses) =>
      addresses.map((address) => ({
        ...address,
        isDefault: address.id === updated.id
      }))
    );
  }
}
