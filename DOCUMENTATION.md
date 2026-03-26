# Application users (Angular)

Doc détaillée côté architecture : **[Amaz_back/docs/apps/users-app.md](../Amaz_back/docs/apps/users-app.md)**

Ici c’est juste le rappel : boutique client, tout passe par la **gateway** ; l’intercepteur ajoute la **PoW** et les bons en-têtes. Le point d’entrée HTTP est `GatewayApiService` sous `src/app/core/services/`.
