import { Injectable } from '@angular/core';

import { GatewayApiService } from './gateway-api.service';

export interface WishlistItemDto {
  productId: string;
  addedAt?: string;
}

export interface WishlistMineResponse {
  success?: boolean;
  data?: {
    name?: string;
    shareToken?: string;
    shareDisabled?: boolean;
    items?: WishlistItemDto[];
  };
}

export interface WishlistShareResponse {
  success?: boolean;
  data?: {
    shareToken?: string;
    sharePath?: string;
  };
}

export interface WishlistSharedResponse {
  success?: boolean;
  data?: {
    name?: string;
    productIds?: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(private readonly gateway: GatewayApiService) {}

  getMine() {
    return this.gateway.get<WishlistMineResponse>('/wishlists/me');
  }

  addProduct(productId: string) {
    return this.gateway.patch<WishlistMineResponse>('/wishlists/me', { addProductId: productId });
  }

  removeProduct(productId: string) {
    return this.gateway.patch<WishlistMineResponse>('/wishlists/me', { removeProductId: productId });
  }

  setShareDisabled(disabled: boolean, reason?: string) {
    return this.gateway.patch<WishlistMineResponse>('/wishlists/me', {
      shareDisabled: disabled,
      ...(reason ? { shareDisabledReason: reason } : {})
    });
  }

  ensureShareLink(regenerate = false) {
    return this.gateway.post<WishlistShareResponse>('/wishlists/me/share', { regenerate });
  }

  getSharedByToken(token: string) {
    return this.gateway.get<WishlistSharedResponse>(`/wishlists/shared/${encodeURIComponent(token)}`);
  }
}
