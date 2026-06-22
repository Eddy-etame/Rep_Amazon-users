// Service messagerie REST (front) : appelle /messages et /messages/conversations (le temps réel
// passe par service-client-socket / WebSocket).
import { Injectable } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';

import { ServiceApiGateway } from './service-api-gateway';
import { ServiceClientSocket } from './service-client-socket';

export interface MessagePayload {
  produitId?: string;
  productId?: string;
  destinataireId: string;
  vendorId?: string;
  userId?: string;
  userName?: string;
  vendorName?: string;
  contenu?: string;
  content?: string;
  subject?: string;
  productTitle?: string;
  orderId?: string;
}

export interface UserVendorMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'vendor';
  content: string;
  sentAt: string;
  productId?: string;
  productTitle?: string;
  orderId?: string;
  read: boolean;
}

export interface UserVendorConversation {
  id: string;
  userId: string;
  userName: string;
  vendorId: string;
  vendorName: string;
  subject: string;
  productId?: string;
  productTitle?: string;
  orderId?: string;
  updatedAt: string;
  messages: UserVendorMessage[];
}

export interface SendVendorMessageInput {
  userId: string;
  userName: string;
  vendorId: string;
  vendorName: string;
  content: string;
  subject: string;
  productId?: string;
  productTitle?: string;
  orderId?: string;
}

interface ConversationsApiResponse {
  success?: boolean;
  data?: UserVendorConversation[];
}

interface MessageApiResponse {
  success?: boolean;
  data?: unknown;
}

@Injectable({ providedIn: 'root' })
export class ServiceMessages {
  private readonly incomingSubject = new Subject<UserVendorMessage>();
  readonly incoming$ = this.incomingSubject.asObservable();
  private socketListening = false;
  private conversations: UserVendorConversation[] = [];

  constructor(
    private readonly gateway: ServiceApiGateway,
    private readonly socketClient: ServiceClientSocket
  ) {}

  listByProduit(produitId: string) {
    return this.gateway.get(`/messages/${encodeURIComponent(produitId)}`);
  }

  send(payload: MessagePayload) {
    return this.gateway.post<MessageApiResponse>('/messages', payload);
  }

  async loadConversations(): Promise<UserVendorConversation[]> {
    try {
      const res = await firstValueFrom(
        this.gateway.get<ConversationsApiResponse>('/messages/conversations')
      );
      this.conversations = Array.isArray(res?.data) ? res.data : [];
    } catch {
      // Conserver l'état en mémoire en cas d'échec
    }
    return this.conversations;
  }

  async connectRealtime(userId: string): Promise<boolean> {
    const connected = await this.socketClient.connect({ userId, role: 'user' });
    if (!connected || this.socketListening) {
      return connected;
    }

    this.socketClient.on('message.new', (payload) => {
      const incoming = payload as Partial<UserVendorMessage> & {
        vendorId?: string;
        vendorName?: string;
        subject?: string;
        userId?: string;
        userName?: string;
      };
      if (!incoming || incoming.senderRole !== 'vendor' || !incoming.content || !incoming.senderId) {
        return;
      }

      const now = new Date().toISOString();
      const message: UserVendorMessage = {
        id: incoming.id ?? `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        conversationId: incoming.conversationId ?? `conv_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        senderId: incoming.senderId,
        senderName: incoming.senderName ?? 'Vendeur',
        senderRole: 'vendor',
        content: incoming.content,
        sentAt: incoming.sentAt ?? now,
        productId: incoming.productId,
        productTitle: incoming.productTitle,
        orderId: incoming.orderId,
        read: false
      };

      const idx = this.conversations.findIndex((conv) => conv.id === message.conversationId);
      if (idx >= 0) {
        this.conversations[idx] = {
          ...this.conversations[idx],
          updatedAt: message.sentAt,
          messages: [...this.conversations[idx].messages, message]
        };
      } else {
        this.conversations.unshift({
          id: message.conversationId,
          userId: incoming.userId ?? userId,
          userName: incoming.userName ?? 'Client',
          vendorId: incoming.vendorId ?? incoming.senderId,
          vendorName: incoming.vendorName ?? incoming.senderName ?? 'Vendeur',
          subject: incoming.subject ?? 'Message vendeur',
          productId: incoming.productId,
          productTitle: incoming.productTitle,
          orderId: incoming.orderId,
          updatedAt: message.sentAt,
          messages: [message]
        });
      }

      this.incomingSubject.next(message);
    });
    this.socketListening = true;
    return true;
  }

  listConversationsForUser(userId: string): UserVendorConversation[] {
    return this.conversations
      .filter((conv) => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async sendToVendor(input: SendVendorMessageInput): Promise<UserVendorConversation> {
    const content = input.content.trim();
    const nowIso = new Date().toISOString();

    const apiPayload: MessagePayload = {
      produitId: input.productId,
      productId: input.productId,
      destinataireId: input.vendorId,
      vendorId: input.vendorId,
      userId: input.userId,
      userName: input.userName,
      vendorName: input.vendorName,
      contenu: content,
      content,
      subject: input.subject,
      productTitle: input.productTitle,
      orderId: input.orderId
    };

    await firstValueFrom(this.send(apiPayload));

    const existing = this.conversations.find(
      (conv) =>
        conv.userId === input.userId &&
        conv.vendorId === input.vendorId &&
        (input.orderId ? conv.orderId === input.orderId : conv.productId === input.productId)
    );
    const conversationId = existing?.id ?? `conv_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const message: UserVendorMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      conversationId,
      senderId: input.userId,
      senderName: input.userName,
      senderRole: 'user',
      content,
      sentAt: nowIso,
      productId: input.productId,
      productTitle: input.productTitle,
      orderId: input.orderId,
      read: true
    };

    const conversation: UserVendorConversation = existing
      ? {
          ...existing,
          subject: existing.subject || input.subject,
          updatedAt: nowIso,
          messages: [...existing.messages, message]
        }
      : {
          id: conversationId,
          userId: input.userId,
          userName: input.userName,
          vendorId: input.vendorId,
          vendorName: input.vendorName,
          subject: input.subject,
          productId: input.productId,
          productTitle: input.productTitle,
          orderId: input.orderId,
          updatedAt: nowIso,
          messages: [message]
        };

    if (existing) {
      this.conversations = this.conversations.map((conv) =>
        conv.id === existing.id ? conversation : conv
      );
    } else {
      this.conversations = [conversation, ...this.conversations];
    }

    this.socketClient.emit('message.new', {
      id: message.id,
      conversationId,
      senderId: input.userId,
      senderName: input.userName,
      senderRole: 'user',
      userId: input.userId,
      userName: input.userName,
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      content,
      subject: input.subject,
      productId: input.productId,
      productTitle: input.productTitle,
      orderId: input.orderId,
      sentAt: nowIso
    });

    return conversation;
  }
}
