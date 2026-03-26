import { Injectable } from '@angular/core';

import { GatewayApiService } from './gateway-api.service';

export interface AiRecommendationPayload {
  requete: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private readonly gateway: GatewayApiService) {}

  getRecommendations(payload: AiRecommendationPayload) {
    return this.gateway.post('/ai/recommendations', payload);
  }
}
