import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="tm-page-head">
      <div class="tm-page-title">
        <h1>Welcome, {{ user()?.fullName }}</h1>
        <p>You are signed in as {{ user()?.role }}.</p>
      </div>
    </div>
    <section class="tm-panel">
      <div class="tm-empty">
        <h2>Nothing here yet</h2>
        <p>Your work will show here as new features arrive.</p>
      </div>
    </section>
  `
})
export class HomeComponent {
  readonly user = inject(AuthService).currentUser;
}
