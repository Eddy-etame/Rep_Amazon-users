import { Injectable } from '@angular/core';

const STORAGE_KEY = 'amaz_sent_sms';

interface StoredSms {
  to: string;
  body: string;
  at: number;
}

@Injectable({ providedIn: 'root' })
export class SmsService {
  async sendVerificationCode(phone: string, code: string): Promise<void> {
    const body = `Votre code de vérification Amaz : ${code}`;
    this.logAndStore(phone, body);
  }

  private logAndStore(to: string, body: string): void {
    const entry: StoredSms = { to, body, at: Date.now() };
    console.log('[SMS mock]', entry);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: StoredSms[] = raw ? JSON.parse(raw) : [];
      list.push(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}
