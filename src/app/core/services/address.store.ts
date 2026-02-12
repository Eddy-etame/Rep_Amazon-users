import { Injectable, effect, signal } from '@angular/core';

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

const STORAGE_PREFIX = 'amaz_addresses_';

@Injectable({ providedIn: 'root' })
export class AddressStore {
  private readonly addressesSignal = signal<DeliveryAddress[]>([]);

  readonly addresses = this.addressesSignal.asReadonly();

  constructor(private readonly userSession: UserSessionStore) {
    this.loadFromStorage();
    effect(() => {
      this.userSession.session();
      this.loadFromStorage();
    });
  }

  private getStorageKey(): string {
    const session = this.userSession.hasValidSession();
    return session ? `${STORAGE_PREFIX}${session.id}` : '';
  }

  private loadFromStorage(): void {
    const key = this.getStorageKey();
    if (!key) {
      this.addressesSignal.set([]);
      return;
    }
    try {
      const raw = localStorage.getItem(key);
      let list = raw ? (JSON.parse(raw) as DeliveryAddress[]) : [];
      if (!Array.isArray(list)) list = [];
      if (list.length === 0 && key === `${STORAGE_PREFIX}mock-user`) {
        list = this.getSeedAddresses();
        localStorage.setItem(key, JSON.stringify(list));
      }
      this.addressesSignal.set(list);
    } catch {
      this.addressesSignal.set([]);
    }
  }

  private getSeedAddresses(): DeliveryAddress[] {
    return [
      {
        id: 'addr-seed-1',
        label: 'Domicile',
        street: '12 avenue des Fleurs',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        phone: '+33 6 12 34 56 78',
        isDefault: true
      },
      {
        id: 'addr-seed-2',
        label: 'Bureau',
        street: '5 rue du Commerce',
        city: 'Lyon',
        postalCode: '69001',
        country: 'France',
        phone: '+33 4 78 12 34 56',
        isDefault: false
      }
    ];
  }

  private persist(): void {
    const key = this.getStorageKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(this.addresses()));
    }
  }

  getAddresses(): DeliveryAddress[] {
    return this.addresses();
  }

  hasAddresses(): boolean {
    return this.addresses().length > 0;
  }

  getDefault(): DeliveryAddress | undefined {
    return this.addresses().find((a) => a.isDefault) ?? this.addresses()[0];
  }

  addAddress(addr: Omit<DeliveryAddress, 'id' | 'isDefault'>): void {
    const list = this.addresses();
    const isFirst = list.length === 0;
    const newAddr: DeliveryAddress = {
      ...addr,
      id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      isDefault: isFirst
    };
    const updated = list.map((a) => (a.isDefault && !isFirst ? { ...a, isDefault: false } : a));
    this.addressesSignal.set([...updated, newAddr]);
    this.persist();
  }

  updateAddress(id: string, partial: Partial<Omit<DeliveryAddress, 'id'>>): void {
    const list = this.addresses();
    const updated = list.map((a) => {
      if (a.id === id) {
        return { ...a, ...partial };
      }
      if (partial.isDefault === true) {
        return { ...a, isDefault: false };
      }
      return a;
    });
    this.addressesSignal.set(updated);
    this.persist();
  }

  deleteAddress(id: string): void {
    const list = this.addresses().filter((a) => a.id !== id);
    const deleted = this.addresses().find((a) => a.id === id);
    if (deleted?.isDefault && list.length > 0) {
      list[0] = { ...list[0], isDefault: true };
    }
    this.addressesSignal.set(list);
    this.persist();
  }

  setDefault(id: string): void {
    this.addressesSignal.set(
      this.addresses().map((a) => ({ ...a, isDefault: a.id === id }))
    );
    this.persist();
  }

  getById(id: string): DeliveryAddress | undefined {
    return this.addresses().find((a) => a.id === id);
  }
}
