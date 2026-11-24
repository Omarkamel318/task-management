import { Injectable } from '@angular/core';

export interface StoredToken {
  token: string;
  expiresAt: string;
}

const STORAGE_KEY = 'tm-auth';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  read(): StoredToken | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const value = JSON.parse(raw) as Partial<StoredToken>;
      if (typeof value.token !== 'string' || typeof value.expiresAt !== 'string') {
        return null;
      }
      return { token: value.token, expiresAt: value.expiresAt };
    } catch {
      return null;
    }
  }

  save(value: StoredToken): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch { }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { }
  }
}
