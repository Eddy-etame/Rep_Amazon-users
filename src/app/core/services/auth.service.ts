import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterPayload) {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: LoginPayload) {
    return this.http.post(`${this.baseUrl}/auth/login`, payload);
  }

  me() {
    return this.http.get(`${this.baseUrl}/auth/me`);
  }
}
