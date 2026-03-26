import { Injectable } from '@angular/core';

const TOKEN_KEY = 'amaz_token';
const TOKEN_EXPIRY_KEY = 'amaz_token_expires_at';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  getToken(): string | null {
    const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRY_KEY) || 0);
    if (expiresAt && Date.now() > expiresAt) {
      this.clearToken();
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string, expiresAt?: number | null): void {
    localStorage.setItem(TOKEN_KEY, token);
    if (expiresAt) {
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
    } else {
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
}
