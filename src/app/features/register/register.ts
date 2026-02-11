import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { UserSessionStore } from '../../core/services/user-session.store';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  constructor(
    private readonly router: Router,
    private readonly userSession: UserSessionStore
  ) {}

  registerError = '';

  private isValidEmail(email: string): boolean {
    const value = email.trim();
    if (!value) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  private isValidPassword(password: string): boolean {
    const value = password.trim();
    if (!value) {
      return false;
    }
    return value.length >= 8;
  }

  isRegisterDisabled(name: string, email: string, password: string): boolean {
    const hasName = !!name.trim();
    return !hasName || !this.isValidEmail(email) || !this.isValidPassword(password);
  }

  handleRegister(name: string, email: string, password: string): void {
    const hasName = !!name.trim();
    if (!hasName) {
      this.registerError = 'Veuillez renseigner votre nom complet.';
      return;
    }
    if (!this.isValidEmail(email)) {
      this.registerError =
        "Veuillez saisir une adresse e-mail valide (par exemple: nom@domaine.com).";
      return;
    }
    if (!this.isValidPassword(password)) {
      this.registerError =
        'Votre mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    this.registerError = '';

    const cleanedName = name.trim() || 'Client';
    const cleanedEmail = email.trim() || 'client@amaz.demo';
    this.userSession.setUser({
      id: 'mock-user',
      nom: cleanedName,
      email: cleanedEmail,
      role: 'client',
      lastLoginAt: Date.now(),
      adresse: '',
      telephone: ''
    });
    this.router.navigateByUrl('/');
  }
}
