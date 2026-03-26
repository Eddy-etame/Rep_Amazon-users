import { Injectable } from '@angular/core';

import { GatewayApiService } from './gateway-api.service';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username?: string;
  phone?: string;
  role?: 'user' | 'vendor';
}

export interface AuthApiUser {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  role?: string;
  emailVerified?: boolean;
  smsVerified?: boolean;
}

export interface AuthResponse {
  success?: boolean;
  data?: {
    user?: AuthApiUser;
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    accessExpiresAt?: number;
    refreshExpiresAt?: number;
  };
}

export interface VerificationStartPayload {
  userId?: string;
  channel: 'email' | 'sms';
  email?: string;
  phone?: string;
}

export interface VerificationStartResponse {
  success?: boolean;
  data?: {
    accepted?: boolean;
    otpRequestId?: string;
    channel?: string;
    destination?: string;
    expiresAt?: number;
    debugCode?: string;
  };
}

export interface VerificationConfirmResponse {
  success?: boolean;
  data?: {
    verified?: boolean;
    user?: AuthApiUser;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly gateway: GatewayApiService) {}

  register(payload: RegisterPayload) {
    return this.gateway.post<AuthResponse>('/auth/register', payload);
  }

  login(payload: LoginPayload) {
    return this.gateway.post<AuthResponse>('/auth/login', payload);
  }

  me() {
    return this.gateway.get<AuthResponse>('/auth/me');
  }

  updateMe(payload: { email: string; nom?: string; username?: string; phone?: string; telephone?: string }) {
    return this.gateway.put<AuthResponse>('/auth/me', payload);
  }

  logout() {
    return this.gateway.post<{ success?: boolean }>('/auth/logout', {});
  }

  startVerification(payload: VerificationStartPayload) {
    return this.gateway.post<VerificationStartResponse>('/auth/verification/start', payload);
  }

  confirmVerification(payload: { otpRequestId: string; code: string }) {
    return this.gateway.post<VerificationConfirmResponse>('/auth/verification/confirm', payload);
  }
}
