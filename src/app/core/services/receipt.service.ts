import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

import type { CartItem } from './cart.store';
import type { DeliveryAddress } from './address.store';

export interface ReceiptOrder {
  id: string;
  createdAt: number;
  items?: CartItem[];
  total?: number;
  adresseLivraison?: DeliveryAddress;
  methodePaiement?: string;
}

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  generateReceiptPdf(order: ReceiptOrder): Blob {
    const doc = new jsPDF();
    const dateStr = new Date(order.createdAt).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    doc.setFontSize(18);
    doc.text('Reçu de commande', 14, 22);
    doc.setFontSize(11);
    doc.text(`Commande ${order.id}`, 14, 30);
    doc.text(`Date : ${dateStr}`, 14, 36);

    if (order.adresseLivraison) {
      const addr = order.adresseLivraison;
      doc.text('Adresse de livraison:', 14, 46);
      doc.text(`${addr.street}`, 14, 52);
      doc.text(`${addr.postalCode} ${addr.city}, ${addr.country}`, 14, 58);
    }

    const paymentDisplay =
      order.methodePaiement === 'card'
        ? 'Carte bancaire (****)'
        : order.methodePaiement === 'livraison'
          ? 'Paiement à la livraison'
          : order.methodePaiement ?? 'Non spécifié';
    doc.text(`Paiement : ${paymentDisplay}`, 14, 68);

    const items = order.items ?? [];
    const tableData = items.map((i) => [
      i.titre,
      i.quantite.toString(),
      this.formatPrice(i.prixUnitaire),
      this.formatPrice(i.prixUnitaire * i.quantite)
    ]);

    autoTable(doc, {
      startY: 78,
      head: [['Article', 'Qté', 'Prix unitaire', 'Sous-total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] }
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 78;
    doc.setFontSize(12);
    doc.text(`Total : ${this.formatPrice(order.total ?? 0)}`, 14, finalY + 15);

    return doc.output('blob');
  }

  async generateReceiptDataUrl(order: ReceiptOrder): Promise<string> {
    const blob = this.generateReceiptPdf(order);
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private formatPrice(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }
}
