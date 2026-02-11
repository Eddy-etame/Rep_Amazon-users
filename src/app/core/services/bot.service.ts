import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface BotPayload {
  etat: string;
  action: string;
}

@Injectable({ providedIn: 'root' })
export class BotService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  send(payload: BotPayload) {
    return this.http.post(`${this.baseUrl}/bot/auth`, payload);
  }
}
