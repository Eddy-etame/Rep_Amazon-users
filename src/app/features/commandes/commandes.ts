import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DepotEtatCommandes } from '../../core/services/depot-etat-commandes';
import { ServiceToast } from '../../core/services/service-toast';
import { PipeDeviseAmaz } from '../../shared/pipes/pipe-devise';
import { PipeLibelleStatutCommande } from '../../shared/pipes/pipe-libelle-statut-commande';

@Component({
  selector: 'app-commandes',
  imports: [CommonModule, RouterLink, PipeDeviseAmaz, PipeLibelleStatutCommande],
  templateUrl: './commandes.html',
  styleUrl: './commandes.scss'
})
export class Commandes implements OnInit {
  constructor(
    readonly ordersState: DepotEtatCommandes,
    private readonly toast: ServiceToast
  ) {}

  ngOnInit(): void {
    void this.ordersState.loadOrders();
  }

  get snapshot() {
    return this.ordersState.snapshot;
  }

  async refreshList(): Promise<void> {
    try {
      await this.ordersState.loadOrders();
      this.toast.show('Commandes actualisées.', 'success', 2500);
    } catch {
      this.toast.show('Impossible d’actualiser les commandes.', 'error');
    }
  }

  formatDeliveryDate(ts: number): string {
    return new Date(ts).toLocaleDateString('fr-FR', { dateStyle: 'medium' });
  }
}
