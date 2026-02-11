import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UserSessionStore } from '../../core/services/user-session.store';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  nom = '';
  email = '';
  adresse = '';
  telephone = '';
  saveMessage = '';

  constructor(
    private readonly router: Router,
    private readonly userSession: UserSessionStore
  ) {
    this.syncFromSession();
  }

  get session() {
    return this.userSession.session;
  }

  private syncFromSession(): void {
    const s = this.userSession.hasValidSession();
    if (s) {
      this.nom = s.nom ?? '';
      this.email = s.email ?? '';
      this.adresse = s.adresse ?? '';
      this.telephone = s.telephone ?? '';
    }
  }

  saveProfile(): void {
    this.userSession.updateUser({
      nom: this.nom.trim(),
      email: this.email.trim(),
      adresse: this.adresse.trim(),
      telephone: this.telephone.trim()
    });
    this.saveMessage = 'Profil mis à jour (mock, aucune donnée réelle transmise).';
    setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  logout(): void {
    this.userSession.clear();
    this.router.navigateByUrl('/');
  }
}
