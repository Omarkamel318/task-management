import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="tm-panel">
      <div class="tm-error" role="alert">
        <i class="bi bi-question-circle" aria-hidden="true"></i>
        <div>
          <h1 class="tm-h2">This page does not exist, or you cannot see it</h1>
          <p>The link may be wrong, or it points to a Project you are not a member of.</p>
          <a class="btn btn-primary" routerLink="/">Go to Home</a>
        </div>
      </div>
    </section>
  `
})
export class NotFoundComponent {}
