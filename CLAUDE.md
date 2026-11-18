# Task Management Application

A full stack web app for one company, under 1000 users.
Projects have Tasks and Sub-tasks. Tasks can need ordered, sequential approvals.
Four roles: Admin, Manager, Senior, Junior. In-app notifications. English only.

## Stack

- Backend: .NET 10 Web API
- Frontend: Angular 17, standalone components, signals in services, Bootstrap 5 + ng-bootstrap
- Database: SQL Server
- Data access: EF Core, code first, migrations, through `IAppDbContext`. No repositories
- Validation: FluentValidation
- Sign-in: ASP.NET Core Identity + JWT (8 hours, no refresh tokens)
- Tests: xUnit, Shouldly, NSubstitute. Integration tests on a local SQL Server test database (D43). No Angular unit tests until a runner is chosen

## Architecture

- Monorepo: .NET code in `backend/`, Angular app in `frontend/`. `docs/` stays at the root.
- Clean Architecture, 4 projects: `backend/src/TaskManagement.Domain`, `.Application`, `.Infrastructure`, `.Api`. Solution file is `backend/TaskManagement.sln`.
- Dependencies point inward. Domain references nothing.
- No MediatR. No CQRS. One deployable API.
- Business rules live in Domain. Controllers stay thin.
- Access: role attributes on endpoints, plus one central access service for Department and Project rules.
- Identity user class lives in Infrastructure. Domain refers to users by `int` id only.
- Approvals: an Approvals table. Approval and status rules live in Domain code.
- Dates: stored in UTC. Overdue uses the `Africa/Cairo` date.
- Tests in `backend/tests/`. Angular app in `frontend/`, with `core`, `features`, `shared` under `frontend/src/app/`.

## Conventions

- C#: PascalCase for types, methods, properties. camelCase for locals and parameters. `I` prefix for interfaces. `Async` suffix for async methods.
- Database: plural table names. The Task table is `TaskItems`. `int` identity keys. Enums as `tinyint`. Restrict deletes. `RowVersion` on Projects and TaskItems.
- Angular: kebab-case files. One feature folder per area.
- The API never returns entities. It returns DTOs.
- Errors use ProblemDetails. Validation errors include a field-to-messages list.
- HTTP codes: 400 validation, 401 not signed in or wrong credentials, 403 not allowed, 404 not found or not visible, 409 invalid state or concurrency.
- Secrets (first Admin, JWT key, connection strings) come from user-secrets in dev. Never in source control.
- Production style code. No comments in code.

## Work rules

- Act as a software team lead that work with junior that need to gain more experience and improve his technical skills.
- Build the MVP slice by slice, in the order in `docs/slices.md`.
- Read `docs/STATUS.md` and the docs the slice touches, Update it when a step or slice finishes.
- Restate the slice tasks in short points.
- We will build slice as two parts(backend, frontend), Each part we would pick task by task untill finish the part.
- For each part before build it, Explain for me every thing and new topics if exist in short and direct response.
- Use simple English and short sentences.
- Wait for Omar's confirmation.
- Check every "Done when" line. `dotnet test` passes. Omar tries it in the browser.
- Do not change a decision in `docs/decisions.md` unless asked. New decisions are added as new rows.
- If a rule is missing or unclear, ask. Do not guess.
- Do not pick anything listed under "Open (Batch 2)" in `docs/architecture.md` without asking.
- Never add a DELETE endpoint for Projects or TaskItems.
- When a rule changes, update `docs/business-rules.md` and add a row to `docs/decisions.md`.

## Docs

Read the file before the work it covers:

| File | Read before |
|---|---|
| `docs/STATUS.md` | Every session. Current slice, finished slices, next step, open problems. |
| `docs/slices.md` | Starting or planning a slice. Goal, tasks, and done-when for each slice. |
| `docs/requirements.md` | Any work on roles, permissions, entities, the status flow, notifications, or scope. |
| `docs/business-rules.md` | Any work on Projects, members, tasks, sub-tasks, approvals, comments, or overdue. Write tests from its Given / When / Then lines. |
| `docs/architecture.md` | Creating projects, folders, layers, DbContext, configurations, API endpoints, or error handling. |
| `docs/decisions.md` | Any change that might go against an earlier decision. |

