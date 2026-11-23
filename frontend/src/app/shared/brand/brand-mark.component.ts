import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  standalone: true,
  host: { class: 'd-inline-flex' },
  template: `
    <svg class="tm-mark" width="34" height="14" viewBox="0 0 34 14" aria-hidden="true">
      <line x1="6" y1="7" x2="28" y2="7" />
      <circle class="on" cx="6" cy="7" r="5" />
      <circle class="on" cx="17" cy="7" r="5" />
      <circle cx="28" cy="7" r="5" />
    </svg>
  `
})
export class BrandMarkComponent {}
