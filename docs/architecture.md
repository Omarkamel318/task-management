# Architecture

## 1. Overview

- One deployable .NET 10 Web API and one Angular app.
- SQL Server with EF Core, code first, with migrations.
- Sign-in with ASP.NET Core Identity and JWT.
- Clean Architecture with 4 projects.
- No MediatR. No CQRS. Plain application services.

## 2. Solution layout

```
backend/
  TaskManagement.sln
  src/
    TaskManagement.Domain/
    TaskManagement.Application/
    TaskManagement.Infrastructure/
    TaskManagement.Api/
  tests/
frontend/
  src/app/
    core/
    features/
    shared/
docs/
CLAUDE.md
README.md
```

## 3. Layers

Dependencies point inward only.

```
Api ──> Application ──> Domain
 │            ^
 └──> Infrastructure
```

| Project | Holds | References |
|---|---|---|
| Domain | Entities, enums, value rules, domain exceptions. The approval rules and status transition rules. | Nothing |
| Application | Application services, DTOs, interfaces for outside things (clock, current user, data access), the access service, validation. | Domain |
| Infrastructure | EF Core DbContext, entity configurations, migrations, Identity, JWT token creation, clock, background jobs. | Application, Domain |
| Api | Controllers, auth setup, ProblemDetails mapping, DI wiring, startup. | Application, Infrastructure |

Rules:
- Domain has no EF Core, ASP.NET, or Identity references.
- Business rules live in Domain methods, not in controllers or services.
- Application services load data, call Domain methods, save, and create notifications.
- Controllers stay thin: read the request, call one service method, return the result.

## 4. Access rules

Two levels:

1. **Role attributes** on endpoints, for checks that need only the role. Example: only Admin creates users.
2. **One central access service** in Application, for checks that need data:
   - Can this user see this Project or TaskItem?
   - Is this user the Dept Manager of this Project?
   - Is this user a member of this Project?
   - Is this user an approver on this TaskItem?

Every application service calls the access service before it reads or changes a Project, TaskItem, Approval, or Comment.

Visibility queries are built once in the access service and reused by list endpoints, so lists never show what the user cannot open.

Response codes:
- The user cannot see the resource: 404.
- The user can see it but cannot do the action: 403.

## 5. Domain model notes

- `TaskItem` owns its Approvals. Approval actions go through `TaskItem` methods, so the status and the approvals always change together.
- `TaskItem` checks status transitions against the table in [requirements.md](requirements.md) section 4.
- The current approver is the Pending approval with the lowest Order, while the task is PendingApproval.
- Parent rules (BR12, BR38, BR39) run in the Application service that changes a Sub-task, in the same transaction.
- Domain methods throw domain exceptions. Api maps them to ProblemDetails.
- Time comes from an `IClock` interface. Domain methods receive the time as a parameter.

## 6. Overdue

- "Today" is the current date in the `Africa/Cairo` time zone.
- A task is overdue when its DueDate is before today and its status is open (BR16).
- A `BackgroundService` with a `PeriodicTimer` runs inside the API, in Infrastructure (D8).
- It runs every hour. Each run computes "today" in `Africa/Cairo` and handles every overdue task not yet notified. A missed run is caught up by the next one.
- `OverdueNotifiedAt` prevents a second notification. The update only sets it when it is still null, so two runs never notify twice.

## 7. Data access

- One `AppDbContext` in Infrastructure, based on the Identity DbContext.
- Application reaches data through an `IAppDbContext` interface: `DbSet<T>` properties and `SaveChangesAsync` (D9). `AppDbContext` implements it.
- No repositories. Application references the `Microsoft.EntityFrameworkCore` package, not the Infrastructure project.
- One `IEntityTypeConfiguration<T>` class per entity.
- Plural table names. The Task table is `TaskItems`.
- `int` identity keys. `datetime2` for UTC date-times. `date` for DueDate. Enums as `tinyint`.
- All foreign keys use `DeleteBehavior.Restrict`.
- `RowVersion` on Projects and TaskItems as concurrency tokens.
- Check constraint on TaskItems: Priority is not null exactly when ParentTaskId is null.
- Indexes as listed in [requirements.md](requirements.md) section 3.10.

## 8. API rules

- The API never returns entities. It returns DTOs.
- Errors use ProblemDetails (RFC 7807). Validation errors include a field-to-messages list.
- Status codes:

| Code | When |
|---|---|
| 400 | Validation failed. |
| 401 | Not signed in. |
| 403 | Signed in, can see the resource, not allowed to do the action. |
| 404 | Not found, or the user cannot see it. |
| 409 | Invalid state change, or concurrency conflict. |

- Concurrency: the client sends the RowVersion it read. A mismatch returns 409.
- Routes start with `/api/`. No API versioning (D12).
- Validation: FluentValidation validators in Application, one per request DTO (D10). Failures return 400 ProblemDetails with the field-to-messages list. Business rules stay in Domain.
- Pagination (D11): `?page=1&pageSize=20`. Default page size 20, max 100. Response:

```json
{ "items": [], "page": 1, "pageSize": 20, "totalCount": 0 }
```

- CORS allows the Angular app's origin (D17).

## 9. Notifications delivery

- Notifications are saved in the `Notifications` table by Application services.
- Angular polls the unread count every 30 to 60 s, and loads the list when the user opens it (D7). No SignalR.

## 10. Sign-in and passwords

- One JWT access token, valid 8 hours. No refresh tokens (D19).
- Admin creates a user with a temporary password. The user must change it at first sign-in (D18).
- A forgotten password: Admin resets it to a new temporary password. The user must change it again at the next sign-in.
- No email in MVP.
- Application declares `IAuthService` (sign-in, change password, create user, reset password) and `ITokenService` (JWT creation). Infrastructure implements both with Identity (D35).
- Application reads users through a read-only `IQueryable<UserInfo>` on `IAppDbContext`. It never sees the Identity user class (D28).

## 11. Frontend

- Angular 17. Standalone components. No NgModules (D13).
- One lazy-loaded routes file per feature, for example `features/projects/projects.routes.ts`.
- State lives in services with signals (`signal`, `computed`). HTTP calls live in services. No NgRx.
- UI with Bootstrap 5 and the ng-bootstrap version that supports Angular 17 (D14).
- Angular is served from its own static host, not from the API (D17).

## 12. Testing

Paused for now (D48). No test projects yet. The plan below is for later.

- xUnit, Shouldly, and NSubstitute (D15).
- Projects:
  - `backend/tests/TaskManagement.Domain.UnitTests`: business rules, from the Given / When / Then lines.
  - `backend/tests/TaskManagement.Application.UnitTests`: application services and the access service.
  - `backend/tests/TaskManagement.Api.IntegrationTests`: HTTP, auth, and database, with `WebApplicationFactory` and a local SQL Server test database `TaskManagement_Tests`, reset on each run (D43). Testcontainers can come back when Docker is available.

## 13. Dev setup and hosting

- Dev database: SQL Server installed locally, instance `.\MSSQLSERVER01`, Windows sign-in (D16, D44).
- Migrations are applied by hand. Roles and the first Admin are seeded at startup in Development only (D46).
- Production: Docker containers (D17).

