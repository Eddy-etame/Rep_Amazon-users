import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface MessagePayload {
  produitId: string;
  destinataireId: string;
  contenu: string;
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  listByProduit(produitId: string) {
    return this.http.get(`${this.baseUrl}/messages/${produitId}`);
  }

  send(payload: MessagePayload) {
    return this.http.post(`${this.baseUrl}/messages`, payload);
  }
}
