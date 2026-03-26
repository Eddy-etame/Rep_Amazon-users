import { Injectable } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';

import { GatewayApiService } from './gateway-api.service';
import { SocketClientService } from './socket-client.service';

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

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly storageKey = 'users_vendor_conversations';
  private readonly incomingSubject = new Subject<UserVendorMessage>();
  readonly incoming$ = this.incomingSubject.asObservable();
  private socketListening = false;

  constructor(
    private readonly gateway: GatewayApiService,
    private readonly socketClient: SocketClientService
  ) {}

  listByProduit(produitId: string) {
    return this.gateway.get(`/messages/${encodeURIComponent(produitId)}`);
  }

  send(payload: MessagePayload) {
    return this.gateway.post('/messages', payload);
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

      const conversations = this.readConversations();
      const idx = conversations.findIndex((conv) => conv.id === message.conversationId);
      if (idx >= 0) {
        conversations[idx] = {
          ...conversations[idx],
          updatedAt: message.sentAt,
          messages: [...conversations[idx].messages, message]
        };
      } else {
        conversations.unshift({
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

      this.writeConversations(conversations);
      this.incomingSubject.next(message);
    });
    this.socketListening = true;
    return true;
  }

  listConversationsForUser(userId: string): UserVendorConversation[] {
    return this.readConversations()
      .filter((conv) => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  sendToVendor(input: SendVendorMessageInput): UserVendorConversation {
    const content = input.content.trim();
    const nowIso = new Date().toISOString();
    const conversations = this.readConversations();

    const existing = conversations.find(
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

    const updatedList = existing
      ? conversations.map((conv) => (conv.id === existing.id ? conversation : conv))
      : [conversation, ...conversations];

    this.writeConversations(updatedList);

    void firstValueFrom(
      this.send({
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
      })
    ).catch(() => undefined);

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

  private readConversations(): UserVendorConversation[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as UserVendorConversation[];
    } catch {
      return [];
    }
  }

  private writeConversations(conversations: UserVendorConversation[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(conversations));
  }
}
