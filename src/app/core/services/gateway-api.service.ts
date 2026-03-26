import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/**
 * Single entry for gateway-relative paths. PoW, auth, and X-Request-Id stay in
 * {@link securityHeadersInterceptor}; this service only normalizes the base URL.
 */
@Injectable({ providedIn: 'root' })
export class GatewayApiService {
  /** API origin without trailing slash (matches interceptor PoW gate). */
  readonly baseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  constructor(private readonly http: HttpClient) {}

  /** Absolute URL for a path starting with `/` or a segment without leading slash. */
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

/** Best-effort request id from a failed HttpClient call (gateway may echo `X-Request-Id`). */
export function readGatewayRequestId(err: unknown): string | undefined {
  if (err instanceof HttpErrorResponse) {
    return err.headers?.get('X-Request-Id') ?? undefined;
  }
  return undefined;
}
