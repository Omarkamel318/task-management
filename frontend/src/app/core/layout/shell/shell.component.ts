import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import { BrandMarkComponent } from '../../../shared/brand/brand-mark.component';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../theme/theme.service';

type MenuState = 'closed' | 'open' | 'closing';

const MENU_CLOSE_MS = 300;

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem,
    BrandMarkComponent
  ],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly user = this.auth.currentUser;
  readonly initials = computed(() => initialsOf(this.user()?.fullName ?? ''));
  readonly isDark = computed(() => this.themeService.theme() === 'dark');
  readonly menuState = signal<MenuState>('closed');
  readonly menuOpen = computed(() => this.menuState() === 'open');

  private closeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.closeMenu());
    inject(DestroyRef).onDestroy(() => clearTimeout(this.closeTimer));
  }

  openMenu(): void {
    clearTimeout(this.closeTimer);
    this.menuState.set('open');
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    if (this.menuState() !== 'open') {
      return;
    }
    this.menuState.set('closing');
    this.closeTimer = setTimeout(() => this.menuState.set('closed'), MENU_CLOSE_MS);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  signOut(): void {
    this.auth.signOut();
    this.router.navigateByUrl('/sign-in');
  }
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}
