import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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
  constructor(
    private readonly router: Router,
    private readonly userSession: UserSessionStore,
    private readonly verification: VerificationService
  ) {}

  step: RegisterStep = 'form';
  registerError = '';
  verificationError = '';

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
    this.step = 'channel';
  }

  async sendCode(): Promise<void> {
    this.verificationError = '';
    if (this.verificationChannel === 'phone' && !this.isValidPhone(this.phone)) {
      this.verificationError = 'Veuillez saisir un numéro de téléphone valide.';
      return;
    }
    const target = this.verificationChannel === 'email' ? this.email.trim() : this.phone.trim();
    await this.verification.sendCode(this.verificationChannel, target);
    this.step = 'code';
  }

  verifyAndRegister(): void {
    this.verificationError = '';
    const target = this.verificationChannel === 'email' ? this.email.trim() : this.phone.trim();
    if (!this.verification.verifyCode(target, this.verificationCode)) {
      this.verificationError = 'Code invalide ou expiré. Veuillez réessayer.';
      return;
    }
    this.step = 'done';
    this.userSession.setUser({
      id: 'mock-user',
      nom: this.name.trim() || 'Client',
      email: this.email.trim() || 'client@amaz.demo',
      role: 'client',
      lastLoginAt: Date.now(),
      adresse: '',
      telephone: this.phone.trim() || ''
    });
    this.router.navigateByUrl('/');
  }

  back(): void {
    if (this.step === 'channel') this.step = 'form';
    else if (this.step === 'code') this.step = 'channel';
  }

  get verificationTarget(): string {
    return this.verificationChannel === 'email' ? this.email : this.phone;
  }
}
