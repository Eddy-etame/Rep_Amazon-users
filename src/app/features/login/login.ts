import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService, type AuthApiUser } from '../../core/services/auth.service';
import { AuthTokenService } from '../../core/services/auth-token.service';
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
    private readonly authService: AuthService,
    private readonly authToken: AuthTokenService,
    private readonly userSession: UserSessionStore,
    private readonly cdr: ChangeDetectorRef
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

  private toSession(user: AuthApiUser) {
    return {
      id: user.id,
      nom: user.username || user.email.split('@')[0] || 'Client',
      email: user.email,
      role: 'client' as const,
      lastLoginAt: Date.now(),
      adresse: '',
      telephone: user.phone || ''
    };
  }

  async handleLogin(email: string, password: string): Promise<void> {
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

    try {
      const response = await firstValueFrom(
        this.authService.login({
          email: trimmedEmail,
          password: trimmedPassword
        })
      );

      const user = response.data?.user;
      const token = response.data?.accessToken || response.data?.token;
      if (!response.success || !user || !token) {
        throw new Error('Réponse de connexion invalide.');
      }

      this.authToken.setToken(token, response.data?.accessExpiresAt);
      this.userSession.setUser(this.toSession(user));
      await this.router.navigateByUrl(this.redirectUrl || '/');
    } catch (err: unknown) {
      this.authToken.clearToken();
      this.userSession.clear();
      const httpErr = err as { status?: number; message?: string };
      if (httpErr?.status === 0 || httpErr?.message?.toLowerCase().includes('fetch')) {
        this.loginError = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré (port 3000).';
      } else {
        this.loginError = 'Email ou mot de passe invalide.';
      }
      this.cdr.detectChanges();
    }
  }
}
