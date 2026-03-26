import { Routes } from '@angular/router';

import { Cart } from './features/cart/cart';
import { Checkout } from './features/checkout/checkout';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { OrderDetail } from './features/order-detail/order-detail';
import { Orders } from './features/orders/orders';
import { ProductDetail } from './features/product-detail/product-detail';
import { Products } from './features/products/products';
import { Profile } from './features/profile/profile';
import { Register } from './features/register/register';
import { SharedWishlistPage } from './features/wishlist/shared-wishlist-page';
import { WishlistPage } from './features/wishlist/wishlist-page';
import { LegalPage } from './features/legal/legal-page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home, title: 'Accueil' },
  { path: 'connexion', component: Login, title: 'Connexion' },
  { path: 'inscription', component: Register, title: 'Inscription' },
  { path: 'produits', component: Products, title: 'Produits' },
  { path: 'produits/:id', component: ProductDetail, title: 'Produit' },
  { path: 'panier', component: Cart, title: 'Panier', canActivate: [authGuard] },
  {
    path: 'paiement',
    component: Checkout,
    title: 'Paiement',
    canActivate: [authGuard]
  },
  { path: 'commandes', component: Orders, title: 'Commandes', canActivate: [authGuard] },
  { path: 'commandes/:id', component: OrderDetail, title: 'Détail commande', canActivate: [authGuard] },
  { path: 'favoris', component: WishlistPage, title: 'Liste de souhaits', canActivate: [authGuard] },
  { path: 'liste/:token', component: SharedWishlistPage, title: 'Liste partagée' },
  { path: 'profil', component: Profile, title: 'Profil', canActivate: [authGuard] },
  {
    path: 'cgu',
    component: LegalPage,
    title: 'Conditions générales',
    data: {
      legalTitle: 'Conditions générales d’utilisation',
      legalParagraphs: [
        'Les présentes conditions encadrent l’utilisation de la vitrine Amaz Marketplace (démonstration). Elles peuvent être mises à jour ; la date affichée en pied de page est indicative.',
        'Les vendeurs sont responsables des informations produit, des stocks et des délais annoncés. Amaz agit comme intermédiaire technique dans cette maquette.',
        'Pour toute question juridique réelle, contactez un conseil adapté à votre situation.'
      ]
    }
  },
  {
    path: 'confidentialite',
    component: LegalPage,
    title: 'Confidentialité',
    data: {
      legalTitle: 'Politique de confidentialité',
      legalParagraphs: [
        'Cette application de démonstration peut stocker des préférences locales (ex. historique de recherche) et des jetons de session si vous vous connectez.',
        'Nous ne vendons pas vos données. Les traitements décrits ici sont limités au fonctionnement de la démo.',
        'Vous pouvez effacer les données locales via les paramètres du navigateur.'
      ]
    }
  },
  {
    path: 'contact',
    component: LegalPage,
    title: 'Contact',
    data: {
      legalTitle: 'Contact',
      legalParagraphs: [
        'Pour une démo ou un partenariat, écrivez-nous à l’adresse ci-dessous. Les délais de réponse ne sont pas garantis sur cet environnement de test.'
      ],
      contactEmail: 'contact@amaz-marketplace.example'
    }
  },
  { path: '**', redirectTo: '' }
];
