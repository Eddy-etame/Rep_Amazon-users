import { Routes } from '@angular/router';

import { Panier } from './features/panier/panier';
import { Paiement } from './features/paiement/paiement';
import { Accueil } from './features/accueil/accueil';
import { Connexion } from './features/connexion/connexion';
import { DetailCommande } from './features/detail-commande/detail-commande';
import { Commandes } from './features/commandes/commandes';
import { DetailProduit } from './features/detail-produit/detail-produit';
import { Produits } from './features/produits/produits';
import { Profil } from './features/profil/profil';
import { Inscription } from './features/inscription/inscription';
import { PageFavorisPartagee } from './features/favoris/page-favoris-partagee';
import { PageFavoris } from './features/favoris/page-favoris';
import { PageMentions } from './features/mentions/page-mentions';
import { gardeAuth } from './core/guards/garde-auth';

export const routes: Routes = [
  { path: '', component: Accueil, title: 'Accueil' },
  { path: 'connexion', component: Connexion, title: 'Connexion' },
  { path: 'inscription', component: Inscription, title: 'Inscription' },
  { path: 'produits', component: Produits, title: 'Produits' },
  { path: 'produits/:id', component: DetailProduit, title: 'Produit' },
  { path: 'panier', component: Panier, title: 'Panier', canActivate: [gardeAuth] },
  {
    path: 'paiement',
    component: Paiement,
    title: 'Paiement',
    canActivate: [gardeAuth]
  },
  { path: 'commandes', component: Commandes, title: 'Commandes', canActivate: [gardeAuth] },
  { path: 'commandes/:id', component: DetailCommande, title: 'Détail commande', canActivate: [gardeAuth] },
  { path: 'favoris', component: PageFavoris, title: 'Liste de souhaits', canActivate: [gardeAuth] },
  { path: 'liste/:token', component: PageFavorisPartagee, title: 'Liste partagée' },
  { path: 'profil', component: Profil, title: 'Profil', canActivate: [gardeAuth] },
  {
    path: 'cgu',
    component: PageMentions,
    title: 'Conditions générales',
    data: {
      legalTitle: 'Conditions générales d\u2019utilisation',
      legalParagraphs: [
        'Les présentes conditions encadrent l\u2019utilisation de la vitrine Amaz Marketplace (démonstration). Elles peuvent être mises à jour ; la date affichée en pied de page est indicative.',
        'Les vendeurs sont responsables des informations produit, des stocks et des délais annoncés. Amaz agit comme intermédiaire technique dans cette maquette.',
        'Pour toute question juridique réelle, contactez un conseil adapté à votre situation.'
      ]
    }
  },
  {
    path: 'confidentialite',
    component: PageMentions,
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
    component: PageMentions,
    title: 'Contact',
    data: {
      legalTitle: 'Contact',
      legalParagraphs: [
        'Pour une démo ou un partenariat, écrivez-nous à l\u2019adresse ci-dessous. Les délais de réponse ne sont pas garantis sur cet environnement de test.'
      ],
      contactEmail: 'contact@amaz-marketplace.example'
    }
  },
  { path: '**', redirectTo: '' }
];
