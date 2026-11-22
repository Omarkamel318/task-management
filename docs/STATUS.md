# Status

Last updated: 2026-11-19

The slice plan is in [slices.md](slices.md).

## Current slice

**Slice 0. Walking skeleton.** Backend done. Frontend next.
Q1 to Q5 answered (D28 to D31, D35). Lessons part 1 done. Lessons parts 2 and 3 skipped (D42).
Pre-build answers: D36 to D47. Tests paused (D48). Backend part done (tasks 1 to 10). Frontend part in progress (task 1 of 8 done).
Backend tasks restated and confirmed by Omar on 2026-11-18.

## Finished slices

None yet.

| # | Slice | Finished on |
|---|---|---|

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
   2. Next: Bootstrap, ng-bootstrap, Bootstrap Icons, global styles from `prototype.css`.

## Open problems

### Slice 0 (open)

| # | Question |
|---|---|
| | None. |

### Resolved

| # | Answer |
|---|---|
| S0-6 | SDK 11.0.100 and the .NET 10 runtime build `net10.0`. `dotnet-ef` 10.0.15 installed on 2026-11-19. |
| S0-1 | Local SQL Server test database `TaskManagement_Tests` instead of Testcontainers (D43). |
| S0-2 | `.\MSSQLSERVER01` with Windows sign-in (D44). |
| S0-3 | No lockout for now (D45). |
| S0-4 | Migrations by hand. Seed in Development only (D46). |
| S0-5 | Docs on `main`, then branch `slice-00-walking-skeleton` (D47). |
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
