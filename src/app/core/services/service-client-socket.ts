// Client WebSocket (front acheteur) : se connecte au messaging-service (:3004) pour recevoir les
// messages en temps réel ('message.new').
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import { environment } from '../../../environments/environment';

type SocketEventHandler = (payload: unknown) => void;

@Injectable({ providedIn: 'root' })
export class ServiceClientSocket {
  private socket: Socket | null = null;

  async connect(meta: { userId: string; role: 'user' | 'vendor' }): Promise<boolean> {
    if (this.socket?.connected) {
      return true;
    }

    const baseUrl = environment.socketUrl?.trim();
    if (!baseUrl) {
      return false;
    }

    const namespace = environment.socketNamespace?.trim() ?? '';
    try {
      this.socket = io(`${baseUrl}${namespace}`, {
        transports: ['websocket'],
        auth: meta
      });
      return true;
    } catch {
      this.socket = null;
      return false;
    }
  }

  on(event: string, handler: SocketEventHandler): void {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: SocketEventHandler): void {
    this.socket?.off(event, handler);
  }

  emit(event: string, payload?: unknown): void {
    this.socket?.emit(event, payload);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
