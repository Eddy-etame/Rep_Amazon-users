import { Injectable } from '@angular/core';

import { GatewayApiService } from './gateway-api.service';

export interface BotPayload {
  etat: string;
  action: string;
}

@Injectable({ providedIn: 'root' })
export class BotService {
  constructor(private readonly gateway: GatewayApiService) {}

  send(payload: BotPayload) {
    return this.gateway.post('/bot/auth', payload);
  }
}
