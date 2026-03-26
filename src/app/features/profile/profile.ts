import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import type { DeliveryAddress } from '../../core/services/address-book.store';
import { AddressBookStore } from '../../core/services/address-book.store';
import { AuthService } from '../../core/services/auth.service';
import { AuthTokenService } from '../../core/services/auth-token.service';
import { UserSessionStore } from '../../core/services/user-session.store';
import { VendorBridgeService } from '../../core/services/vendor-bridge.service';

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
    private readonly authService: AuthService,
    private readonly authToken: AuthTokenService,
    private readonly userSession: UserSessionStore,
    readonly addressStore: AddressBookStore,
    private readonly vendorBridge: VendorBridgeService
  ) {
    this.syncFromSession();
    void this.addressStore.load().catch(() => undefined);
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

  async saveProfile(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.authService.updateMe({
          nom: this.nom.trim(),
          email: this.email.trim(),
          telephone: this.telephone.trim()
        })
      );
      const user = response.data?.user;
      if (!response.success || !user) {
        throw new Error('Mise à jour impossible.');
      }

      this.userSession.updateUser({
        nom: user.username || this.nom.trim(),
        email: user.email,
        telephone: user.phone || ''
      });
      this.saveMessage = 'Profil mis à jour.';
    } catch {
      this.saveMessage = 'La mise à jour du profil a échoué.';
    }

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

  async saveAddress(): Promise<void> {
    if (!this.addrStreet.trim() || !this.addrCity.trim() || !this.addrCountry.trim()) {
      return;
    }
    if (this.editingAddress) {
      await this.addressStore.updateAddress(this.editingAddress.id, {
        label: this.addrLabel.trim() || 'Adresse',
        street: this.addrStreet.trim(),
        city: this.addrCity.trim(),
        postalCode: this.addrPostalCode.trim(),
        country: this.addrCountry.trim(),
        phone: this.addrPhone.trim()
      });
    } else {
      await this.addressStore.addAddress({
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

  async setDefaultAddress(id: string): Promise<void> {
    await this.addressStore.setDefault(id);
  }

  async deleteAddress(id: string): Promise<void> {
    await this.addressStore.deleteAddress(id);
  }

  openVendorSpace(): void {
    if (!this.vendorBridge.hasVendorUrl()) {
      this.mockMessage = 'Espace vendeur indisponible pour le moment.';
      return;
    }
    this.vendorBridge.openVendorSpace();
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.authService.logout()).catch(() => undefined);
    this.authToken.clearToken();
    this.userSession.clear();
    await this.router.navigateByUrl('/');
  }
}
