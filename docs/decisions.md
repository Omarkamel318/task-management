# Decisions Log

Append only. Do not change or remove a row. To change a decision, add a new row that replaces it.

| Date | Decision | Reason |
|---|---|---|
| 2026-11-11 | Stack: .NET 8 Web API + Angular | Chosen by Omar |
| 2026-11-11 | Roles: Junior, Senior, Manager, Admin. One role per user | Company has Departments and levels |
| 2026-11-11 | One Department per user. One Manager per Department. A Manager can manage many | Makes "direct Manager" clear |
| 2026-11-11 | Sign-in with email and password. Admin creates accounts | Internal company app |
| 2026-11-11 | Status flow: Pending Approval, Approved (To Do), In Progress, Done, Rejected, Cancelled | Covers approval and work states |
| 2026-11-11 | Approvals are ordered. Status changes only when all approve | Needed for multi-Manager approval |
| 2026-11-11 | Rejected is final. No edit and resubmit | Keeps the flow simple |
| 2026-11-11 | No delete. Use Cancelled and Archive | Keeps history and data safe |
| 2026-11-11 | In-app notifications only for MVP | Email is on the Later list |
| 2026-11-11 | Due date is date only. Overdue after end of day | Simple |
| 2026-11-11 | Rule changed: a Senior-to-Senior task needs the Project's Department Manager | Changed by Omar |
| 2026-11-11 | D1: Clean Architecture, 4 projects, no MediatR and no CQRS | Approval and Department rules are complex. A Domain layer keeps them testable |
| 2026-11-11 | D2: EF Core only | Fewer than 1000 users. Less code |
| 2026-11-11 | D3: SQL Server | Common in the Egyptian .NET market |
| 2026-11-11 | D4: ASP.NET Core Identity + JWT | Safe password handling. Standard tool |
| 2026-11-11 | D5: Role attributes + one central access service | Department and Project rules depend on data |
| 2026-11-11 | D6: Approvals table, rules in Domain code | Simple and easy to test |
| 2026-11-11 | Data model: int keys, UTC dates, Restrict deletes | Simple. Avoids cascade path errors |
| 2026-11-12 | Tasks and Sub-tasks share one `TaskItems` table with `ParentTaskId` | Same rules for both. Less duplicated code. Approvals and notifications need one key. Changed by Omar |
| 2026-11-12 | Junior and Senior see only the Projects they are members of | Membership is the only door for them. Clarified by Omar |
| 2026-11-16 | A Junior picks at least one approver (a Manager or a Senior of the Project). His direct Manager is not forced | Chosen by Omar |
| 2026-11-16 | Only Managers and Seniors can approve. A Junior never approves | Clarified by Omar |
| 2026-11-16 | A Manager who approves a Senior's task can add other Managers or project Seniors as approvers | Clarified by Omar |
| 2026-11-17 | Approvals are sequential. Only the next approver in order can act and is notified (BR33) | Chosen by Omar |
| 2026-11-17 | Only the Manager of the Project's Department can cancel a task (BR43) | Chosen by Omar |
| 2026-11-17 | No edits while a task is Pending Approval. To fix it, reject or cancel, then create a new task (BR34) | Chosen by Omar |
| 2026-11-17 | Proposed conventions are confirmed as final | Confirmed by Omar |
| 2026-11-17 | User deactivation removed from MVP. BR27, BR28, and `Users.IsActive` removed. Moved to the Later list | Chosen by Omar |
| 2026-11-17 | A member can be removed from a Project only if no task in it is assigned to him (BR35) | Chosen by Omar |
| 2026-11-17 | A rejection stops the approval cycle (BR36) | Default proposed by team lead. Omar did not object |
| 2026-11-17 | Sub-tasks can be added only when the parent is Approved or In Progress (BR37) | Default proposed by team lead. Omar did not object |
| 2026-11-17 | A Junior can add Sub-tasks to his own Task, assigned to himself (BR45) | Default proposed by team lead. Omar did not object |
| 2026-11-17 | Parent becomes Done when all Sub-tasks are Done or Cancelled, with at least one Done (BR12) | Default proposed by team lead. Omar did not object |
| 2026-11-17 | An archived Project is read only (BR42) | Default proposed by team lead. Omar did not object |
| 2026-11-17 | Overdue covers open tasks only and notifies once per task (BR16) | Default proposed by team lead. Omar did not object |
| 2026-11-17 | Requirements split into `CLAUDE.md` and `docs/` files for Claude Code | Less context per session. Rules and status change at different speeds |
| 2026-11-17 | Stack changed: .NET 10 Web API + Angular. Replaces the .NET 8 row | .NET 8 support ended on 10 Nov 2026. .NET 10 is the current LTS. No code existed yet. Chosen by Omar |
| 2026-11-17 | Frontend: Angular 17 | Chosen by Omar. Angular 17 no longer gets security fixes. Accepted |
| 2026-11-17 | D7: Notifications reach the client by polling the unread count every 30 to 60 s. No SignalR | Simple. Enough for about 100 concurrent users. Chosen by Omar |
| 2026-11-17 | D8: Overdue job is a `BackgroundService` with `PeriodicTimer` inside the API. Runs every hour | Built in, no package. A missed run is caught up by the next one. Chosen by Omar |
| 2026-11-17 | D9: Application reaches data through an `IAppDbContext` interface. No repositories | Least code. Visibility queries reuse `IQueryable`. Chosen by Omar |
| 2026-11-17 | D10: Input validation with FluentValidation | Clean rule classes, cross-field rules, easy to test. Chosen by Omar |
| 2026-11-17 | D11: Offset pagination `?page=&pageSize=`. Response envelope `{ items, page, pageSize, totalCount }`. Default 20, max 100 | Simple. Page numbers in the UI. Chosen by Omar |
| 2026-11-17 | D12: No API versioning. Routes start with `/api/` | Angular is the only client and ships with the API. Chosen by Omar |
| 2026-11-17 | D13: Angular uses standalone components, lazy-loaded routes per feature, and services with signals for state. No NgRx | Angular 17 default. Small learning curve. Chosen by Omar |
| 2026-11-17 | D14: UI with Bootstrap 5 and ng-bootstrap | Familiar CSS, full control of the look. Chosen by Omar |
| 2026-11-17 | D15: .NET tests use xUnit, Shouldly, and NSubstitute. Integration tests use `WebApplicationFactory` and Testcontainers SQL Server | Common, free tools. Tests run against a real SQL Server. Chosen by Omar |
| 2026-11-17 | D16: Dev database is SQL Server installed locally | Chosen by Omar |
| 2026-11-17 | D17: Production runs in Docker containers. Angular is served from its own static host. The API allows the Angular origin with CORS | Same image in dev and prod. Independent deploys. Chosen by Omar |
| 2026-11-17 | D18: Admin sets a temporary password. The user must change it at first sign-in. A forgotten password is reset by Admin to a new temporary password (OQ1) | No email in MVP. Admin never knows the final password. Chosen by Omar |
| 2026-11-17 | D19: Only one JWT access token, valid 8 hours. No refresh tokens (OQ2) | Simple. One sign-in per work day. Chosen by Omar |
| 2026-11-17 | D20: Monorepo layout. .NET solution, `src/`, and `tests/` in `backend/`. Angular app in `frontend/` (replaces `client/`). `docs/` stays at the root | Keeps .NET and Angular tools apart. Chosen by Omar |
| 2026-11-17 | D20: MVP screens are the HTML prototypes in `docs/prototypes`. They add My tasks (Senior, Junior) and My approvals (Manager, Senior) (OQ4) | Approvers need one place to find tasks outside their Projects (BR40). Chosen by Omar |
| 2026-11-17 | D21: The system generates the temporary password on user create and reset. Admin sees it once. Replaces "Admin sets" in D18. The forced change at first sign-in stays (BR46) | Stronger passwords. Admin does not invent them. Chosen by Omar |
| 2026-11-17 | D22: Admin can rename a Department and change or remove its Manager (BR47) | Company structure changes. Chosen by Omar |
| 2026-11-17 | D23: Admin can edit a user's name, email, role, and Department (OQ7, BR48). Side effects are open in OQ10 | Chosen by Omar |
| 2026-11-17 | D24: UI style is clean and calm, with a left sidebar, a light and dark theme toggle, and a table plus Kanban board for Project tasks | Chosen by Omar |
| 2026-11-17 | D25: The Kanban board shows Pending approval, To do, In progress, and Done. Rejected and Cancelled are hidden on the board and shown in the table | Closed tasks do not clutter the board. Chosen by Omar |
| 2026-11-17 | D26: UI colors changed. Main color is deep blue (#1F5FAD light, #7FB0F0 dark) on neutral gray backgrounds, with solid buttons. Done badges use green (#2F7D4F light, #6CCB95 dark). Other status colors stay | Chosen by Omar. Green Done keeps it apart from blue In progress |
| 2026-11-17 | D27: MVP build order is the 19 vertical slices in `docs/slices.md`. Progress is tracked in `docs/STATUS.md` (OQ4 build order) | Ordered by dependency and risk. Blocked slices come last. Confirmed by Omar |
| 2026-11-17 | D28: The Identity user class lives in Infrastructure. Domain refers to users by `int` id only | Domain stays free of Identity. Chosen by Omar |
| 2026-11-17 | D29: The first Admin is seeded from dev user-secrets (email and password) | No password in source control. Chosen by Omar |
| 2026-11-17 | D30: Wrong email or password on sign-in returns 401 ProblemDetails | Chosen by Omar |
| 2026-11-17 | D31: No Angular unit tests until a test runner is chosen. The runner stays open in Batch 2 | Chosen by Omar |
| 2026-11-18 | D32: OQ9 answered. The assignee of a task can be one of its approvers (BR41 changed). Replaces "the assignee is not an approver" | Chosen by Omar |
| 2026-11-18 | D33: MVP build order is the 20 vertical slices in `docs/slices.md`. Notifications and approvals come right after task create. Reassign is its own slice. Replaces the order in D27 | Approvals are the highest risk. Chosen by Omar |
| 2026-11-18 | D34: Slice work loop. Claude writes the code step by step and explains it. Omar reviews and runs it. One branch `slice-NN-name` and one PR into `main` per slice | Chosen by Omar |
| 2026-11-18 | D35: Q5 answered. Application declares `IAuthService` (sign-in, change password, create user, reset password) and `ITokenService` (JWT creation). Both are implemented in Infrastructure with Identity. Application reads users through a read-only `IQueryable<UserInfo>` on `IAppDbContext` | Application never sees the Identity user class (D28). User reads join and page in SQL. Chosen by Omar |
| 2026-11-18 | D36: The second D20 row (MVP screens are the HTML prototypes, My tasks, My approvals) is renamed D20b. The monorepo row stays D20 | Two rows had the same number. Chosen by Omar |
| 2026-11-18 | D37: `docs/REQUIREMENTS.md` is renamed to `docs/requirements.md` | Links use lowercase. Linux and Docker are case sensitive. Chosen by Omar |
| 2026-11-18 | D38: Identity tables use plural names without the `AspNet` prefix: `Users`, `Roles`, `UserRoles`, `UserClaims`, `UserLogins`, `UserTokens`, `RoleClaims` | Same plural rule as other tables. Chosen by Omar |
| 2026-11-18 | D39: Angular keeps the JWT in `localStorage` | Sign-in survives new tabs and restarts for the 8 hour token. Chosen by Omar |
| 2026-11-18 | D40: DI wiring uses `AddApplication()` and `AddInfrastructure(configuration)` extension methods | `Program.cs` stays small. Each layer owns its wiring. Chosen by Omar |
| 2026-11-18 | D41: Sign-in returns `{ token, expiresAt, user: { id, email, fullName, role } }`. `GET /api/auth/me` returns the same `user` object | One user shape for the client. Chosen by Omar |
| 2026-11-18 | D42: Slice 0 skips lessons parts 2 and 3. Topics are explained per step while building | Chosen by Omar |
| 2026-11-18 | D43: S0-1 answered. Integration tests use a local SQL Server test database `TaskManagement_Tests`, reset on each run, instead of Testcontainers. Replaces the Testcontainers part of D15. The test base stays small so Testcontainers can come back later | No Docker until development ends. Chosen by Omar |
| 2026-11-18 | D44: S0-2 answered. Dev SQL Server instance is `.\MSSQLSERVER01` with Windows sign-in | Chosen by Omar |
| 2026-11-18 | D45: S0-3 answered. No account lockout for now | Not needed now. Chosen by Omar |
| 2026-11-18 | D46: S0-4 answered. Migrations are applied by hand with `dotnet ef database update`. Roles and the first Admin are seeded at startup in Development only. The seed skips what already exists | Chosen by Omar |
| 2026-11-18 | D47: S0-5 answered. Docs are committed on `main`, then work goes on branch `slice-00-walking-skeleton`. `.claude/settings.local.json`, `bin/`, `obj/`, and `node_modules/` are ignored | Chosen by Omar |
| 2026-11-18 | D48: Tests are paused. No test projects, no unit tests, no integration tests for now. `dotnet test` is not a Done-when check for now. The test lines in `docs/slices.md` and the Given / When / Then lines in `docs/business-rules.md` stay as the plan for later. The D15 tools and the D43 test database stay chosen for when tests come back | Build the MVP first. Tests are added later. Chosen by Omar |
| 2026-11-18 | D49: Central Package Management. All NuGet versions live in `backend/Directory.Packages.props`. `.csproj` files list package names only. Microsoft packages stay on 10.0.x for `net10.0`. `System.IdentityModel.Tokens.Jwt` matches the IdentityModel version that JwtBearer uses | One place for versions. No version drift between projects. Chosen by Omar |
| 2026-11-19 | D50: Application folders are by feature (`Auth/`, `Users/`, later `Projects/`, `Tasks/`). Each feature has `DTOs/` (API request and response types) and `Validators/`. Interfaces, other records, and services sit at the feature root. Shared types go in `Common/Interfaces/` and `Common/Exceptions/`. One file per type | Everything for a feature is in one place. Request types and validators are easy to find. Chosen by Omar |
| 2026-11-19 | D51: `Users.FullName` is `nvarchar(100)`, required. Validators use the same limit | Enough for real names. Keeps the column indexable. Chosen by Omar |
| 2026-11-21 | D52: Roles and the first Admin are seeded at startup in every environment by `DatabaseSeeder`. Values come from configuration: user-secrets in dev, env variables `Seed__AdminEmail`, `Seed__AdminFullName`, `Seed__AdminPassword` in production. The Admin step is skipped when any Admin exists, before the settings are read, so the env variables can be removed after the first start. `Seed:AdminMustChangePassword` is `true` by default and `false` in `appsettings.Development.json`. Replaces the "Development only" seed part of D46. Migrations stay by hand | Production needs a first Admin. The bootstrap password works once. Chosen by Omar |
| 2026-11-21 | D53: Password policy: at least 8 characters, with at least one letter (any case), one digit, and one symbol. Identity settings cover length, digit, and symbol. Upper and lower case are not required. A custom `LetterPasswordValidator` checks the letter rule. Request validators for new passwords copy these rules | Identity has no "any letter" setting. The rule runs in `UserManager`, so every path that sets a password uses it. Chosen by Omar |
| 2026-11-21 | D54: CORS allows any origin, any header, and any method for now, without credentials. Narrows D17 until Release, when it is limited to the Angular origin | The token is sent in a header, not a cookie, so other sites cannot use it. Simple while the Angular host is not fixed. Chosen by Omar |
| 2026-11-21 | D54: CORS allows any origin, header, and method for now, without credentials. Narrows D17 until Release, when it is limited to the Angular origin | The token is sent in a header, not a cookie, so other sites cannot use it. Simple while hosting is open. Chosen by Omar |
| 2026-11-21 | D55: No success envelope. Success returns the DTO with 200 or 201. Every error, including 401 and 404 from the pipeline, uses one ProblemDetails shape (`type`, `title`, `status`, `detail`, `traceId`, plus `errors` for 400) written by one `GlobalExceptionHandler` and `UseStatusCodePages`. Validation runs in one action filter that throws `ValidationException` | HTTP status already says success or failure. Standard shape (RFC 9457). One place formats errors. Chosen by Omar |
