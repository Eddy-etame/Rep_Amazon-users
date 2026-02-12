import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { DeliveryAddress } from '../../core/services/address.store';
import { AddressStore } from '../../core/services/address.store';
import { UserSessionStore } from '../../core/services/user-session.store';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  nom = '';
  email = '';
  adresse = '';
  telephone = '';
  saveMessage = '';
  mockMessage = '';

  showAddressForm = false;
  editingAddress: DeliveryAddress | null = null;
  addrLabel = '';
  addrStreet = '';
  addrCity = '';
  addrPostalCode = '';
  addrCountry = '';
  addrPhone = '';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userSession: UserSessionStore,
    readonly addressStore: AddressStore
  ) {
    this.syncFromSession();
  }

  get session() {
    return this.userSession.session;
  }

  get addressMsg() {
    return this.route.snapshot.queryParamMap.get('msg') === 'address';
  }

  get addresses() {
    return this.addressStore.addresses();
  }

  private syncFromSession(): void {
    const s = this.userSession.hasValidSession();
    if (s) {
      this.nom = s.nom ?? '';
      this.email = s.email ?? '';
      this.adresse = s.adresse ?? '';
      this.telephone = s.telephone ?? '';
    }
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  showMockMessage(section: string): void {
    this.mockMessage = `${section} : fonctionnalité à venir (mock).`;
    setTimeout(() => {
      this.mockMessage = '';
    }, 3000);
  }

  saveProfile(): void {
    this.userSession.updateUser({
      nom: this.nom.trim(),
      email: this.email.trim(),
      adresse: this.adresse.trim(),
      telephone: this.telephone.trim()
    });
    this.saveMessage = 'Profil mis à jour (mock, aucune donnée réelle transmise).';
    setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  openAddAddress(): void {
    this.editingAddress = null;
    this.addrLabel = '';
    this.addrStreet = '';
    this.addrCity = '';
    this.addrPostalCode = '';
    this.addrCountry = '';
    this.addrPhone = '';
    this.showAddressForm = true;
  }

  openEditAddress(addr: DeliveryAddress): void {
    this.editingAddress = addr;
    this.addrLabel = addr.label;
    this.addrStreet = addr.street;
    this.addrCity = addr.city;
    this.addrPostalCode = addr.postalCode;
    this.addrCountry = addr.country;
    this.addrPhone = addr.phone;
    this.showAddressForm = true;
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddress = null;
  }

  saveAddress(): void {
    if (!this.addrStreet.trim() || !this.addrCity.trim() || !this.addrCountry.trim()) {
      return;
    }
    if (this.editingAddress) {
      this.addressStore.updateAddress(this.editingAddress.id, {
        label: this.addrLabel.trim() || 'Adresse',
        street: this.addrStreet.trim(),
        city: this.addrCity.trim(),
        postalCode: this.addrPostalCode.trim(),
        country: this.addrCountry.trim(),
        phone: this.addrPhone.trim()
      });
    } else {
      this.addressStore.addAddress({
        label: this.addrLabel.trim() || 'Adresse',
        street: this.addrStreet.trim(),
        city: this.addrCity.trim(),
        postalCode: this.addrPostalCode.trim(),
        country: this.addrCountry.trim(),
        phone: this.addrPhone.trim()
      });
    }
    this.cancelAddressForm();
  }

  setDefaultAddress(id: string): void {
    this.addressStore.setDefault(id);
  }

  deleteAddress(id: string): void {
    this.addressStore.deleteAddress(id);
  }

  logout(): void {
    this.userSession.clear();
    this.router.navigateByUrl('/');
  }
}
