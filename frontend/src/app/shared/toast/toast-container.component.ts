import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="tm-toasts" role="status" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div class="tm-toast" [class.is-danger]="toast.kind === 'danger'">
          <i class="bi" [class.bi-exclamation-octagon]="toast.kind === 'danger'" [class.bi-check2-circle]="toast.kind === 'success'" aria-hidden="true"></i>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toasts = inject(ToastService).toasts;
}
