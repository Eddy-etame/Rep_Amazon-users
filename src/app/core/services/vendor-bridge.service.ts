import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorBridgeService {
  getVendorUrl(): string {
    return environment.vendorAppUrl?.trim() ?? '';
  }

  hasVendorUrl(): boolean {
    return this.getVendorUrl().length > 0;
  }

  openVendorSpace(options?: { newTab?: boolean }): boolean {
    const targetUrl = this.getVendorUrl();
    if (!targetUrl) {
      return false;
    }

    // Navigate in same tab by default to avoid popup-blocker failures.
    if (options?.newTab) {
      window.open(targetUrl, '_blank', 'noopener');
      return true;
    }
    window.location.assign(targetUrl);
    return true;
  }
}
