import { hoteDevServeur } from '../../../shared-frontend/hote-dev-serveur';

const h = hoteDevServeur();

export const environment = {
  production: false,
  apiBaseUrl: `http://${h}:3000/api/v1`,
  powDifficulty: 3,
  vendorAppUrl: `http://${h}:4201/vendeur/tableau-de-bord`,
  socketUrl: `http://${h}:3004`,
  socketNamespace: '/messages'
};
