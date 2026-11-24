import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'danger';

export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const SUCCESS_MS = 3500;
const DANGER_MS = 6000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly toastsSignal = signal<Toast[]>([]);

  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, kind: ToastKind = 'success'): void {
    const toast: Toast = { id: this.nextId++, message, kind };
    this.toastsSignal.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), kind === 'danger' ? DANGER_MS : SUCCESS_MS);
  }

  dismiss(id: number): void {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }
}
