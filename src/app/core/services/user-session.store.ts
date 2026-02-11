import { Injectable, signal } from '@angular/core';

export interface UserSession {
  id: string;
  nom: string;
  email: string;
  role: 'client' | 'gestionnaire';
  lastLoginAt: number;
  adresse?: string;
  telephone?: string;
}

const STORAGE_KEY = 'amaz_user_session';
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

@Injectable({ providedIn: 'root' })
export class UserSessionStore {
  private readonly sessionSignal = signal<UserSession | null>(this.readFromStorage());

  readonly session = this.sessionSignal.asReadonly();

  constructor() {
    // Normalize any expired session on startup.
    this.hasValidSession();
  }

  setUser(session: UserSession): void {
    this.sessionSignal.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  clear(): void {
    this.sessionSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  updateUser(partial: Partial<UserSession>): void {
    const current = this.sessionSignal();
    if (!current) {
      return;
    }
    const updated = { ...current, ...partial };
    this.sessionSignal.set(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  /**
   * Returns the current session if it is still valid, otherwise clears it and returns null.
   */
  hasValidSession(): UserSession | null {
    const current = this.sessionSignal();
    if (!current) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - current.lastLoginAt > SESSION_MAX_AGE_MS;
    if (isExpired) {
      this.clear();
      return null;
    }

    return current;
  }

  /**
   * Convenience helper to know if the user is considered logged in.
   */
  isLoggedIn(): boolean {
    return this.hasValidSession() !== null;
  }

  private readFromStorage(): UserSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as UserSession;
      const now = Date.now();
      if (!parsed.lastLoginAt || now - parsed.lastLoginAt > SESSION_MAX_AGE_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
