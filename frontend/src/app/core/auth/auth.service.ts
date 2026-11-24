import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, SignInRequest } from '../models/auth.model';
import { User } from '../models/user.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly stored = this.storage.read();
  private readonly tokenSignal = signal<string | null>(this.stored?.token ?? null);
  private readonly expiresAtSignal = signal<number | null>(toTime(this.stored?.expiresAt));
  private readonly currentUserSignal = signal<User | null>(null);

  readonly token = this.tokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isSignedIn = computed(() => this.hasValidToken());

  hasValidToken(): boolean {
    return this.tokenSignal() !== null && isFuture(this.expiresAtSignal());
  }

  signIn(request: SignInRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/sign-in`, request).pipe(
      tap(response => {
        this.storage.save({ token: response.token, expiresAt: response.expiresAt });
        this.tokenSignal.set(response.token);
        this.expiresAtSignal.set(toTime(response.expiresAt));
        this.currentUserSignal.set(response.user);
      }),
      map(response => response.user)
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap(user => this.currentUserSignal.set(user))
    );
  }

  signOut(): void {
    this.storage.clear();
    this.tokenSignal.set(null);
    this.expiresAtSignal.set(null);
    this.currentUserSignal.set(null);
  }
}

function toTime(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function isFuture(time: number | null): boolean {
  return time !== null && time > Date.now();
}
