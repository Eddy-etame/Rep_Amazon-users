# Guide de lecture — app `users` (vitrine acheteur)

Comment lire le front client. L'app est en **Angular standalone**, tout en SCSS
maison (pas d'UI kit), et **tous les appels passent par la gateway**.

## Convention de nommage (importante)

Les fichiers sont en français, avec deux préfixes qui disent leur nature :
- **`service-*`** = un *service* Angular (logique, appels HTTP) → ex. `service-auth.ts` → classe `ServiceAuth`.
- **`depot-*`** = un *dépôt d'état* (store, données gardées en mémoire avec des signals) → ex. `depot-panier.ts` → classe `DepotPanier`.

## Le chemin d'un appel API

1. Un composant appelle un service (ex. `ServiceProduits`).
2. Le service passe par **`ServiceApiGateway`** (`core/services/service-api-gateway.ts`), qui centralise les URLs `/api/v1/...`.
3. L'**intercepteur** `core/http/intercepteur-entetes-securite.ts` ajoute à chaque requête : la **preuve de travail** (via `service-pow.ts`), l'**empreinte client**, le `X-Request-Id` et le `Authorization: Bearer` si connecté.
4. La gateway répond, le service met à jour le **dépôt** concerné, le composant se met à jour automatiquement (signals).

## Carte des dossiers (`src/app/`)

### `core/` — le socle (pas d'écran ici)
| Élément | Rôle |
|---------|------|
| `http/intercepteur-entetes-securite.ts` | Ajoute PoW + en-têtes de sécurité à chaque requête. À lire en premier. |
| `guards/garde-auth.ts` | Protège les routes qui exigent une connexion (panier, commandes, profil…). |
| `services/service-api-gateway.ts` | Point d'entrée HTTP unique vers la gateway. |
| `services/service-auth.ts`, `service-jeton-auth.ts`, `service-verification.ts` | Connexion, inscription, gestion du token, OTP. |
| `services/service-pow.ts` | Calcule la preuve de travail côté client. |
| `services/service-produits.ts`, `service-commandes.ts`, `service-messages.ts`, `service-ia.ts`, `service-retour-commande.ts`, `service-favoris.ts` | Appels aux domaines de l'API. |
| `services/service-recu.ts`, `service-validation-carte.ts`, `service-actions-panier.ts`, `service-devise.ts`, `service-partage.ts`, `service-toast.ts`, `service-pont-vendeur.ts`, `service-client-socket.ts` | Utilitaires métier (reçu PDF, validation de carte, panier, devise, partage, notifications, lien vendeur, websocket). |
| `services/depot-*.ts` | États gardés en mémoire : panier, catalogue, commandes, favoris, session, carnet d'adresses. |
| `utils/` | `crypto.ts`, `empreinte.ts`, `id-requete.ts`, `statut-commande.ts`. |

### `features/` — un dossier par page
`accueil`, `produits` (liste) + `detail-produit`, `panier`, `paiement`, `commandes` +
`detail-commande`, `favoris` (`page-favoris` + `page-favoris-partagee`), `connexion`,
`inscription`, `profil`, `mentions` (pages légales). Chaque page = un trio
`.ts` / `.html` / `.scss`.

### `shared/` — réutilisable entre les pages
| Élément | Rôle |
|---------|------|
| `components/barre-haute/` | En-tête sticky (recherche, navigation, panier). |
| `components/barre-bas/` | Pied de page. |
| `pipes/pipe-devise.ts` | Formatage des prix. |
| `pipes/pipe-libelle-statut-commande.ts` | Libellé lisible d'un statut de commande. |

### Racine `src/app/`
`app.ts` (coquille : barre-haute + `<router-outlet>` + barre-bas), `app.routes.ts`
(toutes les routes + gardes), `app.config.ts` (HttpClient + intercepteur).

## « Où je regarde si… »

| Question | Fichier de départ |
|----------|-------------------|
| Comment la PoW est ajoutée aux requêtes ? | `core/http/intercepteur-entetes-securite.ts` + `core/services/service-pow.ts` |
| Le parcours panier → paiement → commande ? | `features/panier/`, `features/paiement/`, `core/services/service-commandes.ts` |
| La génération du reçu PDF ? | `core/services/service-recu.ts` |
| Le flux de retour + QR code ? | `core/services/service-retour-commande.ts` |
| La messagerie temps réel ? | `core/services/service-messages.ts` + `service-client-socket.ts` |
