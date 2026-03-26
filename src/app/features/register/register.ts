import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService, type AuthApiUser } from '../../core/services/auth.service';
import { AuthTokenService } from '../../core/services/auth-token.service';
import { UserSessionStore } from '../../core/services/user-session.store';
import { VerificationService } from '../../core/services/verification.service';

type RegisterStep = 'form' | 'channel' | 'code' | 'done';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private registeredUserId: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly authToken: AuthTokenService,
    private readonly userSession: UserSessionStore,
    private readonly verification: VerificationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  step: RegisterStep = 'form';
  registerError = '';
  verificationError = '';
  loading = false;

  name = '';
  email = '';
  password = '';
  phone = '';
  verificationChannel: 'email' | 'phone' = 'email';
  verificationCode = '';

  private isValidEmail(email: string): boolean {
    const value = email.trim();
    if (!value) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private isValidPassword(password: string): boolean {
    return password.trim().length >= 8;
  }

  private isValidPhone(phone: string): boolean {
    return phone.replace(/\D/g, '').length >= 8;
  }

  private toSession(user: AuthApiUser) {
    return {
      id: user.id,
      nom: user.username || this.name.trim() || 'Client',
      email: user.email,
      role: 'client' as const,
      lastLoginAt: Date.now(),
      adresse: '',
      telephone: user.phone || this.phone.trim() || ''
    };
  }

  canProceedFromForm(): boolean {
    return !!this.name.trim() && this.isValidEmail(this.email) && this.isValidPassword(this.password);
  }

  canProceedFromChannel(): boolean {
    if (this.verificationChannel === 'email') return true;
    return this.isValidPhone(this.phone);
  }

  async goToChannel(): Promise<void> {
    this.registerError = '';
    if (!this.name.trim()) {
      this.registerError = 'Veuillez renseigner votre nom complet.';
      return;
    }
    if (!this.isValidEmail(this.email)) {
      this.registerError = "Veuillez saisir une adresse e-mail valide.";
      return;
    }
    if (!this.isValidPassword(this.password)) {
      this.registerError = 'Votre mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    this.loading = true;
    try {
      this.step = 'channel';
    } finally {
      this.loading = false;
    }
  }

  async sendCode(): Promise<void> {
    this.verificationError = '';
    if (this.verificationChannel === 'phone' && !this.isValidPhone(this.phone)) {
      this.verificationError = 'Veuillez saisir un numéro de téléphone valide.';
      return;
    }

    this.loading = true;
    try {
      if (!this.registeredUserId) {
        const registerResponse = await firstValueFrom(
          this.authService.register({
            email: this.email.trim(),
            password: this.password.trim(),
            username: this.name.trim(),
            phone: this.phone.trim() || undefined,
            role: 'user'
          })
        );

        const user = registerResponse.data?.user;
        const token = registerResponse.data?.accessToken || registerResponse.data?.token;
        if (!registerResponse.success || !user || !token) {
          throw new Error('Réponse d’inscription invalide.');
        }

        this.registeredUserId = user.id;
        this.authToken.setToken(token, registerResponse.data?.accessExpiresAt);
        this.userSession.setUser(this.toSession(user));
      }

      await this.verification.sendCode({
        userId: this.registeredUserId,
        channel: this.verificationChannel,
        email: this.email.trim(),
        phone: this.phone.trim()
      });

      this.step = 'code';
    } catch {
      this.verificationError =
        'Impossible d’envoyer le code de vérification pour le moment.';
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
    }
  }

  async verifyAndRegister(): Promise<void> {
    this.verificationError = '';
    const verified = await this.verification.verifyCode(this.verificationCode);
    if (!verified) {
      this.verificationError = 'Code invalide ou expiré. Veuillez réessayer.';
      return;
    }

    this.step = 'done';
    await this.router.navigateByUrl('/');
  }

  back(): void {
    if (this.step === 'channel') this.step = 'form';
    else if (this.step === 'code') this.step = 'channel';
  }

  get verificationTarget(): string {
    return this.verificationChannel === 'email' ? this.email : this.phone;
  }

  get debugCode(): string | null {
    return this.verification.getPendingDebugCode();
  }
}
