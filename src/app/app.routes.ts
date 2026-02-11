import { Routes } from '@angular/router';

import { Cart } from './features/cart/cart';
import { Checkout } from './features/checkout/checkout';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { Orders } from './features/orders/orders';
import { ProductDetail } from './features/product-detail/product-detail';
import { Products } from './features/products/products';
import { Profile } from './features/profile/profile';
import { Register } from './features/register/register';
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
  { path: 'profil', component: Profile, title: 'Profil', canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
