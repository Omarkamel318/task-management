# Status

Last updated: 2026-11-18

The slice plan is in [slices.md](slices.md).

## Current slice

**Slice 0. Walking skeleton.** Planning the build.
Q1 to Q5 answered (D28 to D31, D35). Lessons part 1 done. Lessons parts 2 and 3 skipped (D42).
Pre-build answers: D36 to D47. No code yet.
Backend tasks restated and confirmed by Omar on 2026-11-18.

## Finished slices

None yet.

| # | Slice | Finished on |
|---|---|---|

## Next step

1. Omar installs the .NET 10 SDK and the `dotnet-ef` global tool, version 10 (S0-6).
2. Build Slice 0 backend, task by task:
   1. Git setup, solution, 4 `src` projects, 3 test projects, references.
   2. NuGet packages.
   3. Domain and Application basics, `AddApplication()`.
   4. Infrastructure: `AppUser`, `AppDbContext`, `AddInfrastructure()`.
   5. First migration and the Development seed.
   6. JWT, `AuthService`, `CurrentUser`.
   7. Api setup: auth, fallback policy, CORS, HTTPS, exception handler, validation hook.
   8. `POST /api/auth/sign-in`, `GET /api/auth/me`.
   9. Integration test base and the 3 tests.
3. Then the Slice 0 frontend.

## Open problems

### Slice 0 (open)

| # | Question |
|---|---|
| S0-6 | Install the .NET 10 SDK and the `dotnet-ef` global tool (version 10). Only SDK 8.0.100 is installed. |

### Resolved

| # | Answer |
|---|---|
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
