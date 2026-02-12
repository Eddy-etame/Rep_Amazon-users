import { Injectable } from '@angular/core';

import { EmailService } from './email.service';
import { SmsService } from './sms.service';

const VERIFICATION_CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 min

interface PendingVerification {
  target: string;
  code: string;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class VerificationService {
  private pending: Map<string, PendingVerification> = new Map();

  constructor(
    private readonly email: EmailService,
    private readonly sms: SmsService
  ) {}

  async sendCode(channel: 'email' | 'phone', target: string): Promise<void> {
    const code = this.generateCode();
    const expiresAt = Date.now() + VERIFICATION_CODE_EXPIRY_MS;
    this.pending.set(target.toLowerCase(), { target, code, expiresAt });

    if (channel === 'email') {
      await this.email.sendVerificationCode(target, code);
    } else {
      await this.sms.sendVerificationCode(target, code);
    }
  }

  verifyCode(target: string, code: string): boolean {
    const key = target.toLowerCase();
    const pending = this.pending.get(key);
    if (!pending) return false;
    if (Date.now() > pending.expiresAt) {
      this.pending.delete(key);
      return false;
    }
    if (pending.code !== code.trim()) return false;
    this.pending.delete(key);
    return true;
  }

  private generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}
