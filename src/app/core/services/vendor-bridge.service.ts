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

  openVendorSpace(): boolean {
    const targetUrl = this.getVendorUrl();
    if (!targetUrl) {
      return false;
    }
    window.open(targetUrl, '_blank', 'noopener');
    return true;
  }
}
