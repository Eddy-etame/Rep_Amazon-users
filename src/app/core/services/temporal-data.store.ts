import { Injectable, signal } from '@angular/core';

import type { CartItem } from './cart.store';

export type Validite = 'actif' | 'a_actualiser';

export interface Recommendation {
  id: string;
  titre: string;
  categorie: string;
  ville: string;
  prix: number;
  createdAt: number;
  validUntil: number;
  t: number;
  validite: Validite;
}

export interface CommandeMock {
  id: string;
  statut: 'en_attente' | 'confirmee' | 'annulee' | 'expiree';
  createdAt: number;
  t: number;
  validite: Validite;
  items?: CartItem[];
  total?: number;
}

export interface TemporalSnapshot {
  now: number;
  recommandations: Recommendation[];
  commandes: CommandeMock[];
}

@Injectable({ providedIn: 'root' })
export class TemporalDataStore {
  private readonly baseNow = Date.now();
  private readonly recommandationsBase: Omit<Recommendation, 't' | 'validite'>[] = [
    {
      id: 'prod-1',
      titre: 'Casque Bluetooth Pro',
      categorie: 'Électronique',
      ville: 'Douala',
      prix: 59000,
      createdAt: this.baseNow - 1000 * 60 * 15,
      validUntil: this.baseNow + 1000 * 60 * 45
    },
    {
      id: 'prod-2',
      titre: 'Sac à dos urbain',
      categorie: 'Mode',
      ville: 'Yaoundé',
      prix: 32000,
      createdAt: this.baseNow - 1000 * 60 * 90,
      validUntil: this.baseNow + 1000 * 60 * 10
    },
    {
      id: 'prod-3',
      titre: 'Mixeur compact',
      categorie: 'Cuisine',
      ville: 'Bafoussam',
      prix: 27500,
      createdAt: this.baseNow - 1000 * 60 * 240,
      validUntil: this.baseNow - 1000 * 60 * 20
    },
    {
      id: 'prod-4',
      titre: 'Ordinateur portable 15\"',
      categorie: 'Informatique',
      ville: 'Douala',
      prix: 325000,
      createdAt: this.baseNow - 1000 * 60 * 30,
      validUntil: this.baseNow + 1000 * 60 * 90
    },
    {
      id: 'prod-5',
      titre: 'Smartphone 4G Dual SIM',
      categorie: 'Électronique',
      ville: 'Yaoundé',
      prix: 145000,
      createdAt: this.baseNow - 1000 * 60 * 8,
      validUntil: this.baseNow + 1000 * 60 * 50
    },
    {
      id: 'prod-6',
      titre: 'Chaussures de sport légères',
      categorie: 'Mode',
      ville: 'Douala',
      prix: 28000,
      createdAt: this.baseNow - 1000 * 60 * 200,
      validUntil: this.baseNow + 1000 * 60 * 15
    },
    {
      id: 'prod-7',
      titre: 'Robot de cuisine multifonction',
      categorie: 'Cuisine',
      ville: 'Yaoundé',
      prix: 95000,
      createdAt: this.baseNow - 1000 * 60 * 120,
      validUntil: this.baseNow + 1000 * 60 * 5
    },
    {
      id: 'prod-10',
      titre: 'Montre connectée fitness',
      categorie: 'Électronique',
      ville: 'Bafoussam',
      prix: 45000,
      createdAt: this.baseNow - 1000 * 60 * 60,
      validUntil: this.baseNow + 1000 * 60 * 20
    }
  ];

  private readonly commandesBase: Omit<CommandeMock, 't' | 'validite'>[] = [
    {
      id: 'cmd-1024',
      statut: 'confirmee',
      createdAt: this.baseNow - 1000 * 60 * 35
    },
    {
      id: 'cmd-1009',
      statut: 'en_attente',
      createdAt: this.baseNow - 1000 * 60 * 5
    },
    {
      id: 'cmd-1001',
      statut: 'confirmee',
      createdAt: this.baseNow - 1000 * 60 * 180,
      items: [
        {
          productId: 'prod-1',
          titre: 'Casque Bluetooth Pro',
          prixUnitaire: 59000,
          quantite: 1,
          imagePrincipale:
            'https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          productId: 'prod-6',
          titre: 'Chaussures de sport légères',
          prixUnitaire: 28000,
          quantite: 1,
          imagePrincipale:
            'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600'
        }
      ],
      total: 87000
    },
    {
      id: 'cmd-1002',
      statut: 'annulee',
      createdAt: this.baseNow - 1000 * 60 * 300,
      items: [
        {
          productId: 'prod-3',
          titre: 'Mixeur compact',
          prixUnitaire: 27500,
          quantite: 1,
          imagePrincipale:
            'https://images.pexels.com/photos/3738093/pexels-photo-3738093.jpeg?auto=compress&cs=tinysrgb&w=600'
        }
      ],
      total: 27500
    },
    {
      id: 'cmd-1003',
      statut: 'en_attente',
      createdAt: this.baseNow - 1000 * 60 * 20,
      items: [
        {
          productId: 'prod-5',
          titre: 'Smartphone 4G Dual SIM',
          prixUnitaire: 145000,
          quantite: 1,
          imagePrincipale:
            'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          productId: 'prod-10',
          titre: 'Montre connectée fitness',
          prixUnitaire: 45000,
          quantite: 1,
          imagePrincipale:
            'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600'
        }
      ],
      total: 190000
    }
  ];

  private userCommandes: Omit<CommandeMock, 't' | 'validite'>[] = [];

  readonly snapshot = signal<TemporalSnapshot>(this.computeSnapshot());

  now(): number {
    return Date.now();
  }

  tick(): void {
    this.snapshot.set(this.computeSnapshot());
  }

  private computeSnapshot(): TemporalSnapshot {
    const now = this.now();
    const recommandations = this.recommandationsBase.map((item) => {
      const t = Math.max(0, Math.round((now - item.createdAt) / 60000));
      const validite: Validite = now <= item.validUntil ? 'actif' : 'a_actualiser';
      return { ...item, t, validite };
    });

    const commandesBase = [...this.commandesBase, ...this.userCommandes];
    const commandes = commandesBase.map((item) => {
      const t = Math.max(0, Math.round((now - item.createdAt) / 60000));
      const validite: Validite = t <= 120 ? 'actif' : 'a_actualiser';
      return { ...item, t, validite };
    });

    return { now, recommandations, commandes };
  }

  constructor() {
    setInterval(() => this.tick(), 30000);
  }

  addCommandeFromCart(cartItems: CartItem[]): void {
    if (!cartItems.length) {
      return;
    }
    const createdAt = this.now();
    const total = cartItems.reduce(
      (sum, item) => sum + item.prixUnitaire * item.quantite,
      0
    );
    const nextId = `cmd-${1000 + this.snapshot().commandes.length + 1}`;

    const nouvelleCommande: Omit<CommandeMock, 't' | 'validite'> = {
      id: nextId,
      statut: 'en_attente',
      createdAt,
      items: cartItems,
      total
    };

    this.userCommandes = [nouvelleCommande, ...this.userCommandes];
    this.tick();
  }
}
