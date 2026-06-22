// Page DÉTAIL PRODUIT : fiche produit (galerie, description, ajout au panier) + produits liés.
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DepotPanier } from '../../core/services/depot-panier';
import { ServiceMessages } from '../../core/services/service-messages';
import {
  type CatalogProduct,
  DepotCatalogueProduits
} from '../../core/services/depot-catalogue-produits';
import { ServicePartage } from '../../core/services/service-partage';
import { ServiceToast } from '../../core/services/service-toast';
import { DepotSessionUtilisateur } from '../../core/services/depot-session-utilisateur';
import { DepotFavoris } from '../../core/services/depot-favoris';
import { PipeDeviseAmaz } from '../../shared/pipes/pipe-devise';

@Component({
  selector: 'app-detail-produit',
  imports: [CommonModule, RouterLink, FormsModule, PipeDeviseAmaz],
  templateUrl: './detail-produit.html',
  styleUrl: './detail-produit.scss'
})
export class DetailProduit {
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
    private readonly productCatalog: DepotCatalogueProduits,
    private readonly cart: DepotPanier,
    private readonly userSession: DepotSessionUtilisateur,
    private readonly router: Router,
    private readonly messagesService: ServiceMessages,
    private readonly shareService: ServicePartage,
    private readonly toast: ServiceToast,
    private readonly titleService: Title,
    private readonly metaService: Meta,
    readonly wishlistStore: DepotFavoris
  ) {
    route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (!id) {
        this.product = undefined;
        this.updateSeo(undefined);
        return;
      }

      const found = this.productCatalog.byId(id) ?? (await this.productCatalog.loadProduct(id));
      if (found) {
        this.product = found;
        this.selectedImage = found.imagePrincipale;
        this.updateSeo(found);
      } else {
        this.product = undefined;
        this.updateSeo(undefined);
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

  readonly productImagePlaceholder = '/product-placeholder.svg';

  sameCategoryRelated(): CatalogProduct[] {
    const p = this.product;
    if (!p) return [];
    return this.productCatalog
      .products()
      .filter((x) => x.id !== p.id && (x.stock ?? 0) > 0 && x.categorie === p.categorie)
      .slice(0, 8);
  }

  productCardImageSrc(url: string | undefined): string {
    const u = String(url || '').trim();
    if (!u) return this.productImagePlaceholder;
    const lower = u.toLowerCase();
    if (lower.includes('bing.com') || lower.includes('bing.net')) {
      return this.productImagePlaceholder;
    }
    return u;
  }

  onProductImageError(event: Event): void {
    const el = event.target as HTMLImageElement;
    if (!el || el.dataset['fallback'] === '1') return;
    el.dataset['fallback'] = '1';
    el.src = this.productImagePlaceholder;
  }

  private updateSeo(product: CatalogProduct | undefined): void {
    if (!product) {
      this.titleService.setTitle('Produit — Amaz');
      this.metaService.updateTag({
        name: 'description',
        content: 'Découvrez notre catalogue et trouvez les meilleurs produits sur Amaz.'
      });
      return;
    }

    const title = `${product.titre} — Amaz`;
    const descriptionSource = product.descriptionCourte || product.descriptionDetaillee || product.titre;
    const description =
      descriptionSource.length > 160 ? `${descriptionSource.slice(0, 157)}...` : descriptionSource;
    const productUrl = `https://amaz-marketplace.example/produits/${product.id}`;
    const image = product.imagePrincipale || 'https://amaz-marketplace.example/product-placeholder.svg';

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: productUrl });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });
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
    try {
      await this.messagesService.connectRealtime(session.id);
      await this.messagesService.sendToVendor({
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
    } catch {
      this.vendorMessageError = 'Impossible d\'envoyer le message. Réessayez.';
    }
  }
}
