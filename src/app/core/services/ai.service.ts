import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface AiRecommendationPayload {
  requete: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getRecommendations(payload: AiRecommendationPayload) {
    return this.http.post(`${this.baseUrl}/ai/recommendations`, payload);
  }
}
