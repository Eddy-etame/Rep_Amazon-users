import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CartStore } from '../../core/services/cart.store';
import { MessagesService } from '../../core/services/messages.service';
import {
  ProductMock,
  ProductsMockStore
} from '../../core/services/products-mock.store';
import { UserSessionStore } from '../../core/services/user-session.store';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, FormsModule, AmazCurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail {
  product?: ProductMock;
  selectedImage?: string;
  quantity = 1;
  quantityOptions = Array.from({ length: 30 }, (_, i) => i + 1);
  vendorMessageDraft = '';
  vendorMessageError = '';
  vendorMessageSuccess = '';

  private readonly vendorId = 'vendor_demo_01';
  private readonly vendorName = 'Amaz Vendor';

  constructor(
    route: ActivatedRoute,
    products: ProductsMockStore,
    private readonly cart: CartStore,
    private readonly userSession: UserSessionStore,
    private readonly router: Router,
    private readonly messagesService: MessagesService
  ) {
    const id = route.snapshot.paramMap.get('id');
    if (id) {
      const found = products.byId(id);
      if (found) {
        this.product = found;
        this.selectedImage = found.imagePrincipale;
      }
    }
  }

  selectImage(url: string): void {
    this.selectedImage = url;
  }

  formatStars(note: number): string {
    const full = Math.floor(note);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }

  addToCart(): void {
    if (!this.product) return;
    if (!this.userSession.isLoggedIn()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: `/produits/${this.product.id}` }
      });
      return;
    }
    for (let i = 0; i < this.quantity; i++) {
      this.cart.addItem(this.product);
    }
  }

  buyNow(): void {
    if (!this.product) return;
    if (!this.userSession.isLoggedIn()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: `/produits/${this.product.id}` }
      });
      return;
    }
    for (let i = 0; i < this.quantity; i++) {
      this.cart.addItem(this.product);
    }
    this.router.navigate(['/panier']);
  }

  async sendMessageToVendor(): Promise<void> {
    if (!this.product) return;
    const session = this.userSession.hasValidSession();
    if (!session) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: `/produits/${this.product.id}` }
      });
      return;
    }

    const content = this.vendorMessageDraft.trim();
    if (content.length < 5) {
      this.vendorMessageError = 'Le message doit contenir au moins 5 caractères.';
      return;
    }

    this.vendorMessageError = '';
    await this.messagesService.connectRealtime(session.id);
    this.messagesService.sendToVendor({
      userId: session.id,
      userName: session.nom,
      vendorId: this.vendorId,
      vendorName: this.vendorName,
      content,
      subject: `Question produit: ${this.product.titre}`,
      productId: this.product.id,
      productTitle: this.product.titre
    });

    this.vendorMessageDraft = '';
    this.vendorMessageSuccess = 'Message envoyé au vendeur.';
    setTimeout(() => {
      this.vendorMessageSuccess = '';
    }, 2500);
  }
}

