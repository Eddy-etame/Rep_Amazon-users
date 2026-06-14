import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/**
 * Point d'entrée unique pour les chemins relatifs au gateway. PoW, auth et X-Request-Id
 * restent dans {@link intercepteurEntetesSecurite} ; ce service ne fait que normaliser l'URL de base.
 */
@Injectable({ providedIn: 'root' })
export class ServiceApiGateway {
  /** Origine API sans slash final (correspond au gate PoW de l'intercepteur). */
  readonly baseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  constructor(private readonly http: HttpClient) {}

  /** URL absolue pour un chemin commençant par `/` ou un segment sans slash initial. */
  url(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${p}`;
  }

  get<T>(path: string, options?: Parameters<HttpClient['get']>[1]): Observable<T> {
    return this.http.get<T>(this.url(path), options);
  }

  post<T>(path: string, body: unknown, options?: object): Observable<T> {
    return this.http.post<T>(this.url(path), body, options);
  }

  put<T>(path: string, body: unknown, options?: object): Observable<T> {
    return this.http.put<T>(this.url(path), body, options);
  }

  patch<T>(path: string, body: unknown, options?: object): Observable<T> {
    return this.http.patch<T>(this.url(path), body, options);
  }

  delete<T>(path: string, options?: object): Observable<T> {
    return this.http.delete<T>(this.url(path), options);
  }
}

/** Identifiant de requête (best-effort) depuis un appel HttpClient échoué (le gateway peut renvoyer `X-Request-Id`). */
export function readGatewayRequestId(err: unknown): string | undefined {
  if (err instanceof HttpErrorResponse) {
    return err.headers?.get('X-Request-Id') ?? undefined;
  }
  return undefined;
}
