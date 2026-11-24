import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/http/api-error';
import { BrandMarkComponent } from '../../../shared/brand/brand-mark.component';

type Field = 'email' | 'password';

const WRONG_CREDENTIALS = 'The email or password is wrong. Check both and try again.';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, BrandMarkComponent],
  templateUrl: './sign-in.component.html'
})
export class SignInComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly query = inject(ActivatedRoute).snapshot.queryParamMap;

  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', Validators.required]
  });

  readonly expired = this.query.get('expired') === 'true';
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private readonly serverErrors = signal<Record<string, string[]>>({});

  private readonly returnUrl = safeReturnUrl(this.query.get('returnUrl'));

  submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage.set(null);
    this.serverErrors.set({});
    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.auth.signIn(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: (error: unknown) => {
        this.submitting.set(false);
        if (!(error instanceof ApiError)) {
          return;
        }
        if (error.status === 401) {
          this.errorMessage.set(WRONG_CREDENTIALS);
        } else if (error.status === 400) {
          this.serverErrors.set(error.errors);
        }
      }
    });
  }

  fieldError(field: Field): string | null {
    const control = this.form.controls[field];
    if (control.touched && control.errors) {
      if (control.errors['required']) {
        return field === 'email' ? 'Enter your email.' : 'Enter your password.';
      }
      if (control.errors['email']) {
        return 'Enter a valid email.';
      }
      if (control.errors['maxlength']) {
        return 'The email must be 256 characters or fewer.';
      }
    }
    const key = Object.keys(this.serverErrors()).find(k => k.toLowerCase() === field);
    return key ? this.serverErrors()[key][0] ?? null : null;
  }
}

function safeReturnUrl(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/sign-in')) {
    return '/';
  }
  return value;
}
