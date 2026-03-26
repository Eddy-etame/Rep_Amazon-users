import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly active = signal<{ message: string; variant: ToastVariant } | null>(null);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, variant: ToastVariant = 'info', durationMs = 4000): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.active.set({ message, variant });
    this.hideTimer = setTimeout(() => {
      this.active.set(null);
      this.hideTimer = null;
    }, durationMs);
  }
}
