import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserSessionStore } from '../../core/services/user-session.store';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly redirectUrl: string | null;

  constructor(
    route: ActivatedRoute,
    private readonly router: Router,
    private readonly userSession: UserSessionStore
  ) {
    this.redirectUrl = route.snapshot.queryParamMap.get('redirect');
  }

  loginError = '';

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

  isLoginDisabled(email: string, password: string): boolean {
    return !this.isValidEmail(email) || !this.isValidPassword(password);
  }

  handleLogin(email: string, password: string): void {
    if (!this.isValidEmail(email)) {
      this.loginError =
        "Veuillez saisir une adresse e-mail valide (par exemple: nom@domaine.com).";
      return;
    }
    if (!this.isValidPassword(password)) {
      this.loginError =
        'Votre mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    this.loginError = '';

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Base user: eddy.eetame@gmail.com / Eddy / 123@2026
    const BASE_USER = {
      email: 'eddy.eetame@gmail.com',
      password: '123@2026',
      nom: 'Eddy'
    };

    let nom: string;
    if (trimmedEmail.toLowerCase() === BASE_USER.email && trimmedPassword === BASE_USER.password) {
      nom = BASE_USER.nom;
    } else {
      nom = trimmedEmail.split('@')[0] || 'Client';
    }

    this.userSession.setUser({
      id: 'mock-user',
      nom,
      email: trimmedEmail,
      role: 'client',
      lastLoginAt: Date.now(),
      adresse: '',
      telephone: ''
    });
    this.router.navigateByUrl(this.redirectUrl || '/');
  }
}
