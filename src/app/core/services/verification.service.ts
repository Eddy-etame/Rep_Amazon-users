import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';

interface PendingVerification {
  otpRequestId: string;
  target: string;
  channel: 'email' | 'phone';
  expiresAt: number;
  debugCode?: string;
}

@Injectable({ providedIn: 'root' })
export class VerificationService {
  private pending: PendingVerification | null = null;

  constructor(private readonly authService: AuthService) {}

  async sendCode(options: {
    userId: string;
    channel: 'email' | 'phone';
    email?: string;
    phone?: string;
  }): Promise<void> {
    const response = await firstValueFrom(
      this.authService.startVerification({
        userId: options.userId,
        channel: options.channel === 'phone' ? 'sms' : 'email',
        email: options.email,
        phone: options.phone
      })
    );

    const otpRequestId = response.data?.otpRequestId;
    if (!response.success || !otpRequestId) {
      throw new Error('Impossible d’envoyer le code de vérification.');
    }

    const target = options.channel === 'phone' ? options.phone || '' : options.email || '';
    this.pending = {
      otpRequestId,
      target,
      channel: options.channel,
      expiresAt: Number(response.data?.expiresAt || Date.now()),
      debugCode: response.data?.debugCode
    };
  }

  async verifyCode(code: string): Promise<boolean> {
    if (!this.pending || Date.now() > this.pending.expiresAt) {
      this.pending = null;
      return false;
    }

    const response = await firstValueFrom(
      this.authService.confirmVerification({
        otpRequestId: this.pending.otpRequestId,
        code: code.trim()
      })
    );

    const ok = Boolean(response.success);
    if (ok) {
      this.pending = null;
    }
    return ok;
  }

  getPendingDebugCode(): string | null {
    return this.pending?.debugCode || null;
  }
}
