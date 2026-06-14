import { Injectable } from '@angular/core';

import { ServiceApiGateway } from './service-api-gateway';

export interface AiRecommendationPayload {
  requete: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceIA {
  constructor(private readonly gateway: ServiceApiGateway) {}

  getRecommendations(payload: AiRecommendationPayload) {
    return this.gateway.post('/ai/recommendations', payload);
  }
}
