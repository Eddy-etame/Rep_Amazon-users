// Service de partage (front) : génère/copie les liens de partage (Web Share API ou presse-papier).
import { Injectable } from '@angular/core';

export interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class ServicePartage {
  private lastMessage = '';

  getMessage(): string {
    return this.lastMessage;
  }

  clearMessage(): void {
    this.lastMessage = '';
  }

  /**
   * Utilise l'API Web Share si disponible, sinon copie dans le presse-papiers.
   * @returns true si l'utilisateur a vraisemblablement partagé/copié
   */
  async shareOrCopy(opts: ShareOptions): Promise<boolean> {
    this.lastMessage = '';
    const nav = navigator as Navigator & { share?: (data: ShareOptions) => Promise<void> };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: opts.title, text: opts.text || opts.title, url: opts.url });
        return true;
      } catch (e: unknown) {
        if ((e as Error)?.name === 'AbortError') {
          return false;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(opts.url);
      this.lastMessage = 'Lien copié dans le presse-papiers.';
      return true;
    } catch {
      this.lastMessage = 'Impossible de copier le lien.';
      return false;
    }
  }

  absoluteUrl(pathOrUrl: string): string {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl;
    }
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${base}${path}`;
  }
}
