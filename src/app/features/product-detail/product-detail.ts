import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CartStore } from '../../core/services/cart.store';
import { MessagesService } from '../../core/services/messages.service';
import {
  type CatalogProduct,
  ProductCatalogStore
} from '../../core/services/product-catalog.store';
import { ShareService } from '../../core/services/share.service';
import { ToastService } from '../../core/services/toast.service';
import { UserSessionStore } from '../../core/services/user-session.store';
import { WishlistStore } from '../../core/services/wishlist.store';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, FormsModule, AmazCurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail {
  product?: CatalogProduct;
  selectedImage?: string;
  quantity = 1;

  get quantityOptions(): number[] {
    const max = this.product?.stock != null ? Math.min(this.product.stock, 30) : 30;
    return Array.from({ length: max }, (_, i) => i + 1);
  }
  vendorMessageDraft = '';
  vendorMessageError = '';
  vendorMessageSuccess = '';
  shareHint = '';
  wishlistHint = '';

  constructor(
    route: ActivatedRoute,
    products: ProductCatalogStore,
    private readonly cart: CartStore,
    private readonly userSession: UserSessionStore,
    private readonly router: Router,
    private readonly messagesService: MessagesService,
    private readonly shareService: ShareService,
    private readonly toast: ToastService,
    readonly wishlistStore: WishlistStore
  ) {
    route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (!id) {
        this.product = undefined;
        return;
      }

      const found = products.byId(id) ?? (await products.loadProduct(id));
      if (found) {
        this.product = found;
        this.selectedImage = found.imagePrincipale;
      }
    });
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

  async shareProduct(): Promise<void> {
    if (!this.product) return;
    const url = this.shareService.absoluteUrl(`/produits/${this.product.id}`);
    await this.shareService.shareOrCopy({
      title: this.product.titre,
      text: 'Découvrez ce produit sur Amaz',
      url
    });
    const msg = this.shareService.getMessage() || 'Lien prêt à partager.';
    this.shareHint = msg;
    this.shareService.clearMessage();
    this.toast.show(msg, 'success');
    setTimeout(() => (this.shareHint = ''), 4000);
  }

  async addToWishlist(): Promise<void> {
    if (!this.product) return;
    if (!this.userSession.isLoggedIn()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: `/produits/${this.product.id}` }
      });
      return;
    }
    if (this.wishlistStore.hasProduct(this.product.id)) {
      this.wishlistHint = 'Déjà dans votre liste.';
      this.toast.show(this.wishlistHint, 'info');
      setTimeout(() => (this.wishlistHint = ''), 2500);
      return;
    }
    const ok = await this.wishlistStore.addProduct(this.product.id);
    this.wishlistHint = ok
      ? 'Ajouté à votre liste de souhaits.'
      : this.wishlistStore.lastError() || "Impossible d'ajouter à la liste.";
    this.toast.show(this.wishlistHint, ok ? 'success' : 'error');
    setTimeout(() => (this.wishlistHint = ''), 3500);
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
      vendorId: this.product.vendorId || 'vendor_unknown',
      vendorName: this.product.nomVendeur || 'Vendeur',
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

