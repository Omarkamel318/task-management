# Status

Last updated: 2026-11-24

The slice plan is in [slices.md](slices.md).

## Current slice

**Slice 1. Forced password change.** Not started. Next: restate the backend tasks and plan the backend part.
Slice 0 is finished. Omar merges `chore/walking-skeleton` into `main`, then starts `feature/forced-password-change` for Slice 1 (D60).

## Finished slices

| # | Slice | Finished on |
|---|---|---|
| 0 | Walking skeleton. Backend tasks 1 to 10, frontend tasks 1 to 8. All "Done when" lines checked in the browser by Omar. Open items S0-7 to S0-11 carried forward. | 2026-11-24 |

### Slice 0 notes

Q1 to Q5 answered (D28 to D31, D35). Lessons part 1 done. Lessons parts 2 and 3 skipped (D42).
Pre-build answers: D36 to D47. Tests paused (D48).
Backend tasks restated and confirmed by Omar on 2026-11-18.

## Next step

1. Done: `dotnet-ef` 10.0.15 installed (S0-6). User-secrets on the Api project with `ConnectionStrings:Default`.
2. Build Slice 0 backend, task by task:
   1. Done: git setup, solution, 4 `src` projects, references. Builds on `net10.0`.
   2. Done: NuGet packages with Central Package Management (D49). EF Core and ASP.NET 10.0.15, IdentityModel 8.19.2, FluentValidation 12.2.0. Build clean.
   3. Done: Domain `Roles`, `DomainException`. Application interfaces, auth DTOs, `SignInRequestValidator`, `NotFoundException`, `ForbiddenException`, `AddApplication()`. Folder layout D50. Build clean.
   4. Done: Infrastructure `AppUser`, `AppDbContext` (implements `IAppDbContext`, Identity tables renamed per D38), one configuration per Identity type, `SystemClock`, `AddInfrastructure()`. Wired in `Program.cs`. `FullName` max 100 (D51). Build clean.
   5. Done: migration `InitialCreate` applied. All foreign keys set to Restrict in `AppDbContext`, including Identity tables. `DatabaseSeeder` adds the 4 roles and the first Admin in every environment (D52). Dev reads `Seed:*` from user-secrets, production from `Seed__*` env variables. Skips the Admin when one exists. Production check done on a scratch database.
   6. Done: password policy (D53) with `LetterPasswordValidator`. `JwtOptions` (validated on start, `Jwt:Key` in user-secrets, issuer and audience in `appsettings.json`), `TokenService` (claims `sub`, `email`, `name`, `role`, `jti`, 8 hours), `AuthService.SignInAsync`, `CurrentUser` in Api. `UserInfo` changed to init properties so EF can filter and page `IAppDbContext.Users`.
   7. Done: JwtBearer (issuer, audience, key, HS256 only, lifetime, `MapInboundClaims = false`), fallback policy (sign-in required, also on unknown routes), CORS any origin (D54), HTTPS redirect and HSTS outside Development, `GlobalExceptionHandler` and `UseStatusCodePages` (D55), `ValidationFilter`.
   8. Done: `AuthController` with `POST /api/auth/sign-in` (`[AllowAnonymous]`, 401 ProblemDetails on wrong credentials) and `GET /api/auth/me`. `UserService.GetByIdAsync` in Application reads `IAppDbContext.Users`. Smoke test: 200, 401, 400, 401, 200, 404.
   9. Done (skipped by Omar on 2026-11-22). Covered by the task 8 smoke test: sign-in 200 with a token, wrong password 401, `/me` without a token 401.
   10. Done: Swagger (D56) at `https://localhost:7100/swagger`, Development only.
3. Backend part of Slice 0 is done.
4. Build Slice 0 frontend, task by task:
   1. Done: Angular 17.3 app in `frontend/` (standalone, routing, CSS, no SSR, no spec files). Environment files with `apiUrl`. Empty `core/`, `features/`, `shared/`. Build clean.
   2. Done: `bootstrap` 5.3.3, `@ng-bootstrap/ng-bootstrap` 16.0.0, `@popperjs/core` 2.11.8, `@angular/localize` 17.3.12, `bootstrap-icons` 1.11.3. Bootstrap and icon CSS in `angular.json`, then `styles.css` (copy of `prototype.css` without prototype-only rules, D58). Font link in `index.html` (D57). `@angular/localize/init` in polyfills. No `bootstrap.bundle.js`. Build clean, with a bundle budget warning and a Bootstrap `.form-floating` selector warning.
   3. Done: `core/models` (`User`, `Role`, `SignInRequest`, `AuthResponse`). `TokenStorageService` (one localStorage key `tm-auth` with token and `expiresAt`, D39). `AuthService` with read-only signals `token`, `currentUser`, `isSignedIn`, plus `hasValidToken()`, `signIn()`, `loadCurrentUser()`, `signOut()`. `provideHttpClient()` in `app.config.ts`. Loading `/me` at app start moved to task 4 (needs the auth interceptor). Build clean.
   4. Done: `ProblemDetails` model, `ApiError` and `toApiError()`. `authInterceptor` (Bearer only for `environment.apiUrl`). `errorInterceptor` (401 except sign-in: sign out and go to `/sign-in?expired=true&returnUrl=`; 403, network, and 5xx: danger toast; always rethrows `ApiError`). Own `ToastService` and `ToastContainerComponent` with the prototype `.tm-toast` look (not `NgbToast`). `AppComponent` is `<router-outlet />` plus the toast container. `APP_INITIALIZER` loads `/me` when a valid token is stored, clears an expired one. Build clean.
   5. Done: `authGuard` (`canActivate` and `canActivateChild`; no valid token: sign out, go to `/sign-in?returnUrl=`, plus `expired=true` when a token existed). `guestGuard` (signed in: go to `/`). Routes: `sign-in`, shell with home (`''`) and not-found (`**`), all lazy with `loadComponent` and a tab title. Stub components for sign-in, shell, home, not-found (filled in tasks 6 to 8). Build clean. Note: the production build needs internet, because it inlines the Google Fonts CSS.
   6. Done: sign-in page from `sign-in.html`. Reactive form with the same rules as `SignInRequestValidator`. Field messages, 401 banner, server 400 field messages, "Signing in" spinner, "session ended" banner on `expired=true`, safe `returnUrl` (only paths starting with one `/`). Shared `BrandMarkComponent` (logo SVG). Build clean.
   7. Done: `ThemeService` (`theme` signal, saved choice in `tm-theme` or the OS setting, `effect()` sets `data-bs-theme`), created in `AppComponent`. Shell from the prototype: sidebar (brand, empty nav, "Signed in as {role}"), top bar (theme button, `NgbDropdown` user menu with initials, name, role, Sign out). Mobile sidebar with Bootstrap `offcanvas-lg` CSS, a `menuState` signal (closed, open, closing) for a smooth slide out, and a fading backdrop. Closes on Escape, backdrop, or page change. Fixed the gap above the mobile top bar (`grid-template-rows: auto 1fr`). Home page "Welcome, {name}" with an empty panel. Build clean.
   8. Done: not-found page from `not-found.html` (404 view) inside the shell, button "Go to Home" (Projects come in Slice 4). 403 and network views are toasts (task 4). Smoke check: API wrong password 401, `/me` without token 401, CORS preflight from `http://localhost:4200` allowed, dev server serves the app. Build clean.
5. Frontend part of Slice 0 is done. Omar checked every "Done when" line in the browser on 2026-11-24. All pass. Slice 0 finished.
6. Branch naming changed to `<type>/<slice-name>` (D60). Slice 0 branch renamed to `chore/walking-skeleton` on 2026-11-24.
7. Next: Omar merges `chore/walking-skeleton` into `main` and creates `feature/forced-password-change`. Then Slice 1 backend: restate tasks and plan.

## Open problems

### Slice 0 (open, carried forward)

| # | Question |
|---|---|
| S0-7 | Refresh gap: when `/me` returns 401 at app start (token rejected but date still valid), the "session ended" banner is lost. `returnUrl` is still right. Rare. Fix later if needed. |
| S0-8 | Bundle budget warning: about 570 kB against the 500 kB default (Bootstrap CSS). Transfer size about 105 kB. Raise the warning in `angular.json` or leave it. |
| S0-9 | The production build needs internet, because it inlines the Google Fonts CSS (D57). Turn off font inlining or self-host the font if a build server has no internet. |
| S0-10 | `decisions.md` has the D54 row twice. Remove one when Omar agrees. |
| S0-11 | Network errors show as a toast. The prototype shows a banner at the top of the page. Change later if wanted. |

### Resolved

| # | Answer |
|---|---|
| S0-6 | SDK 11.0.100 and the .NET 10 runtime build `net10.0`. `dotnet-ef` 10.0.15 installed on 2026-11-19. |
| S0-1 | Local SQL Server test database `TaskManagement_Tests` instead of Testcontainers (D43). |
| S0-2 | `.\MSSQLSERVER01` with Windows sign-in (D44). |
| S0-3 | No lockout for now (D45). |
| S0-4 | Migrations by hand. Seed in Development only (D46). |
| S0-5 | Docs on `main`, then branch `slice-00-walking-skeleton` (D47). Branch renamed to `chore/walking-skeleton` (D60). |
| Q5 | `IAuthService` and `ITokenService` in Application, implemented in Infrastructure. Reads through `IQueryable<UserInfo>` on `IAppDbContext` (D35). |
| Q1 | Identity user class in Infrastructure (D28). |
| Q2 | First Admin from dev user-secrets (D29). |
| Q3 | Wrong credentials return 401 (D30). |
| Q4 | No Angular unit tests for now (D31). |
| OQ9 | The assignee can be an approver (D32, BR41). |

### Before later slices

| Item | Blocks |
|---|---|
| OQ6: can a Junior pick a Manager from another Department as approver? | Slice 10 |
| OQ5: does Rejected count as closed for archive and parent auto Done? | Slices 17, 18 |
| OQ8: parent cancel also cancels open Sub-tasks. Confirm. | Slice 17 |
| OQ10: side effects of a role or Department change. | Slice 19 |
| OQ11: Department with no Manager. | Slice 19 |
| Production hosting details (Batch 2). | Release |
| CORS allows any origin for now (task 7). Limit it to the Angular origin. | Release |
