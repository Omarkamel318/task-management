# MVP Slices

The MVP is built in small vertical slices. Each slice gives working backend and Angular work that can be tried end to end.
Slices are ordered by dependency and risk. The approval engine (highest risk) comes right after tasks exist.
Slices that wait on an open question come last.

Progress is tracked in [STATUS.md](STATUS.md). Screens come from [docs/prototypes](prototypes/).

> **Tests are paused (D48).** Skip every test task and every "tests pass" Done-when line for now. They stay here as the plan for later.

| # | Slice | Blocked by |
|---|---|---|
| 0 | Walking skeleton | |
| 1 | Forced password change | |
| 2 | Departments | |
| 3 | Users and Manager assignment | |
| 4 | Projects and access service | |
| 5 | Project members | |
| 6 | Create and view tasks (no approvers) | |
| 7 | Notifications | |
| 8 | Sequential approvals | |
| 9 | Direct Manager approves and adds approvers | |
| 10 | Junior tasks, approver visibility, My approvals | OQ6 |
| 11 | Status flow, cancel, Kanban | |
| 12 | Reassign | |
| 13 | Edit Priority and Due date | |
| 14 | Comments | |
| 15 | Filters, search, My tasks | |
| 16 | Overdue job | |
| 17 | Sub-tasks | OQ5, OQ8 |
| 18 | Archive and read only Project | OQ5 |
| 19 | Admin edits users | OQ10, OQ11 |

---


## Slice 0. Walking skeleton

**Goal:** Admin signs in from Angular and sees an empty app shell. All layers are wired.

**Backend**
- `backend/TaskManagement.sln` and the 4 `src` projects, with correct references. No test projects for now (D48).
- NuGet packages: EF Core, Identity, JWT bearer, FluentValidation. No test packages for now (D48).
- DB: `AppDbContext` based on the Identity DbContext with `int` keys. User fields `FullName`, `MustChangePassword`, `CreatedAt`. `DepartmentId` comes in Slice 2.
- DB: first migration, applied to local SQL Server. Seed the 4 roles and one Admin from dev user-secrets.
- `IAppDbContext` (with read-only `IQueryable<UserInfo>`), `IClock`, `ICurrentUser`, `IAuthService`, `ITokenService` in Application. Implementations in Infrastructure and Api (D35).
- JWT token creation (8 hours) in Infrastructure.
- `POST /api/auth/sign-in`, `GET /api/auth/me`.
- Global exception handler: domain, validation, not found, forbidden, and concurrency errors to ProblemDetails (400, 403, 404, 409).
- FluentValidation hook that returns 400 with a field-to-messages list.
- Fallback policy: sign-in required on every endpoint. CORS for the Angular origin. HTTPS.
- Manual check: sign-in success returns 200 and a token. Wrong password returns 401. `/me` without a token returns 401.

**Frontend**
- New Angular 17 app in `frontend/` with standalone components. Bootstrap 5 and ng-bootstrap.
- Folders `core/`, `features/`, `shared/`. Environment files with the API URL.
- `AuthService` with signals (`token`, `currentUser`, `isSignedIn`) and token storage.
- HTTP interceptor that adds the token. Error interceptor: 401 goes to sign-in, ProblemDetails becomes a message.
- `authGuard`.
- Sign-in page from `sign-in.html`.
- Shell: left sidebar, top bar, sign out, light and dark toggle with D26 colors.
- Not-found page from `not-found.html` and the 404 route.

**Rules:** None. Platform only. D19, D28, D29, D30.

**Done when**
- The manual sign-in and `/me` checks give 200, 401, and 401.
- Admin signs in from the browser and sees the shell with his name.
- Sign out works. A wrong password shows an error.
- An expired or missing token goes back to sign-in.

---

## Slice 1. Forced password change

**Goal:** A user with a temporary password must change it before anything else.

**Backend**
- No DB change. `MustChangePassword` exists.
- `POST /api/auth/change-password` with a validator.
- `mustChangePassword` in the sign-in and `/me` responses.
- A policy or filter that blocks other endpoints while the flag is true.
- Integration tests.

**Frontend**
- Change-password page from `change-password.html`.
- Guard that sends the user there while the flag is true.
- "Change password" link in the user menu.

**Rules:** D18, BR46 (flag part).

**Done when**
- A seeded user with the flag cannot reach the app until he changes the password.
- After the change he can.

---

## Slice 2. Departments

**Goal:** Admin creates, lists, and renames Departments.

**Backend**
- DB: `Departments` table with unique Name and nullable `ManagerId`. `Users.DepartmentId` and the indexes. Restrict on all foreign keys. Migration.
- Domain `Department` entity.
- `DepartmentService`.
- `GET /api/departments`, `POST /api/departments`, `PUT /api/departments/{id}`. Admin role only.
- Validators.
- Pagination envelope helpers, reused by every list later (D11).
- Integration tests.

**Frontend**
- `features/admin` departments screen from `admin-departments.html`: list, create modal, rename modal.
- Shared pagination component.
- Admin-only sidebar item.

**Rules:** BR47 (unique name), D22.

**Done when**
- Admin creates and renames Departments.
- A duplicate name returns 400.
- A non-Admin gets 403.

---

## Slice 3. Users and Manager assignment

**Goal:** Admin creates users, resets passwords, and sets or removes a Department's Manager.

**Backend**
- No new tables. Check indexes.
- Temporary password generator that follows the Identity policy.
- `POST /api/users`: returns the temporary password once.
- `GET /api/users`: paged, filter by role and Department.
- `POST /api/users/{id}/reset-password`.
- `PUT /api/departments/{id}/manager`: set or clear.
- Validators: Senior and Junior need a Department. Manager and Admin have none. The Department Manager must have the Manager role.
- Integration tests.

**Frontend**
- `features/admin` users screen from `admin-users.html`: list, filters, create modal.
- Dialog that shows the temporary password once, with a copy button. Reset action.
- Manager picker on the Departments screen.

**Rules:** BR46, BR47 (Manager part), D21, requirements 2.1.

**Done when**
- Admin creates a Manager, a Senior, and a Junior. Each signs in with the temporary password and is forced to change it.
- Setting a Senior as Manager returns 400.
- A Manager who calls reset gets 403.

---

## Slice 4. Projects and access service

**Goal:** Managers and Seniors create Projects. Each role sees only the right Projects.

**Backend**
- DB: `Projects` table with Status as `tinyint`, `RowVersion`, indexes. `ProjectMembers` table. Migration.
- Domain `Project` entity with the auto membership rule on create.
- `IAccessService`: `VisibleProjects()` as `IQueryable`, `IsDeptManager`, `IsMember`.
- `ProjectService`.
- `POST /api/projects`, `GET /api/projects` (paged), `GET /api/projects/{id}` (404 when not visible).
- Unit tests for the access service. Integration tests per role.

**Frontend**
- `features/projects` from `projects.html`: list, create modal (Department picker for a Manager only), detail header.
- Sidebar items by role.

**Rules:** BR1, BR2, BR4, BR7 (no DELETE), requirements 2.2 (Project part).

**Done when**
- BR1, BR2, BR4 tests pass.
- Admin sees all, read only. A Manager sees only his Departments. A Senior or Junior sees only member Projects.
- A Project the user cannot see returns 404.

---

## Slice 5. Project members

**Goal:** Add and remove Project members.

**Backend**
- No DB change. The table exists.
- `GET /api/projects/{id}/members`, `POST /api/projects/{id}/members`, `DELETE /api/projects/{id}/members/{userId}`. This deletes a membership, not a Project.
- Scope checks in the access service.
- BR35 check written now: assigned TaskItems and Pending approvals. Its tests are finished in Slices 6 and 8.
- Integration tests.

**Frontend**
- Members tab from `project-members.html`: list, "Add member" picker with only eligible users, remove with a confirm step.

**Rules:** BR3, BR35 (part).

**Done when**
- BR3 tests pass (400, 404, 409 cases).
- Remove deletes the row.

---

## Slice 6. Create and view tasks (no approvers)

**Goal:** A Manager or Senior creates a task for a member. It starts as Approved ("To Do").

**Backend**
- DB: `TaskItems` table with all fields, `RowVersion`, the Priority and ParentTaskId check constraint, all indexes. Migration.
- Domain `TaskItem`, enums `TaskStatus` and `Priority`, create factory that sets the start status.
- `TaskService.CreateAsync`.
- `POST /api/projects/{id}/tasks`, `GET /api/projects/{id}/tasks` (paged), `GET /api/tasks/{id}`. No DELETE.
- Validators: Priority required, valid enum, DueDate is date only.
- `VisibleTasks()` in the access service.
- Finish the BR35 "has assigned tasks" tests.

**Frontend**
- `features/tasks`.
- Task create from `task-create.html`, without the approvers section for now.
- Project tasks table from `project-tasks.html`.
- Read-only task detail from `task-detail.html`.
- Shared status and priority badges.

**Rules:** BR7, BR8, BR9 (assign), BR14, BR22, BR23, BR24 (no approvers case), BR32.

**Done when**
- A Manager or Senior creates a task with Status Approved.
- Assigning a non-member returns 400.
- A Junior gets 403 for now (Junior tasks come in Slice 10).
- A member with a task cannot be removed (409).

---

## Slice 7. Notifications

**Goal:** Notifications are saved and shown. First type: Assigned, on task create.

**Backend**
- DB: `Notifications` table and index. Migration.
- `INotificationWriter`: skips the actor, removes duplicate recipients.
- `GET /api/notifications` (paged), `GET /api/notifications/unread-count`, `POST /api/notifications/{id}/read`, `POST /api/notifications/read-all`.
- Assigned notification on task create.
- Unit tests for the writer. Integration tests for the endpoints.

**Frontend**
- `NotificationService` with an unread signal. Polls every 45 s (D7). Stops on sign out.
- Bell badge in the top bar.
- Notifications page from `notifications.html`. A click opens the task.

**Rules:** D7, requirements 5 (Assigned, no notification for own action).

**Done when**
- A new assignee sees the badge grow within about 1 minute.
- A user never gets a notification for his own action.
- Mark read and mark all read update the badge.

---

## Slice 8. Sequential approvals

**Goal:** Create a task with ordered approvers. They approve or reject one by one.

**Backend**
- DB: `Approvals` table and its unique indexes. Migration.
- Domain `Approval`, owned by `TaskItem`.
- `TaskItem.AddApprovers`, `Approve(actor, now)`, `Reject(actor, reason, now)`, `CurrentApprover`.
- Create validators: no duplicates, Manager or member Senior only, not the creator, Senior to Senior must include the Dept Manager. The assignee is allowed (BR41).
- `POST /api/tasks/{id}/approve`, `POST /api/tasks/{id}/reject`.
- Notifications: ApprovalNeeded, Approved, Rejected.
- Finish the BR35 "Pending approval" tests.
- Domain unit tests and integration tests from every Given / When / Then line.

**Frontend**
- Approvers picker in task create, with reorder.
- Approval timeline on task detail.
- Approve and Reject (optional reason) buttons for the current approver.

**Rules:** BR17, BR18, BR20, BR21, BR24 (with approvers), BR25, BR26, BR33, BR36 (rejection part), BR41.

**Done when**
- Every Given / When / Then line of these rules has a passing Domain or integration test.
- The flow A(1), B(2) works in the browser, with notifications.
- An assignee who is also an approver can approve.

---

## Slice 9. Direct Manager approves and adds approvers

**Goal:** The Direct Manager of a Senior creator approves and adds more approvers in one action.

**Backend**
- No DB change.
- `TaskItem.ApproveAndAddApprovers`. New approvers get the next Order numbers.
- Optional `addApproverIds` on approve, or a separate endpoint.
- Domain and integration tests.

**Frontend**
- "Approve and add approvers" action, shown only when allowed.

**Rules:** BR19, BR25.

**Done when**
- The three BR19 tests pass.
- The added approver gets ApprovalNeeded when his turn starts.

---

## Slice 10. Junior tasks, approver visibility, My approvals

**Goal:** Juniors create their own tasks with approvers. Approvers find tasks outside their Projects.

**Blocked by:** OQ6.

**Backend**
- No DB change.
- Junior create rules: only for himself, at least one approver.
- Access service: an approver can see that task only, not the rest of the Project.
- `GET /api/approvals/mine` (paged, my turn or all).
- Integration tests.

**Frontend**
- Junior create form with approvers required.
- `features/my-approvals` from `my-approvals.html` (Manager, Senior).

**Rules:** BR10, BR40.

**Done when**
- BR10 and BR40 tests pass.
- A Manager of another Department who is an approver opens the task (200), but not other tasks in that Project (404).

---

## Slice 11. Status flow, cancel, Kanban

**Goal:** The assignee moves a task forward. The Dept Manager moves it back or cancels it. Kanban board.

**Backend**
- No DB change.
- Domain transition table.
- `TaskItem.ChangeStatus(target, actor facts, now)`. Throws invalid state (409) or forbidden (403).
- `POST /api/tasks/{id}/status`, `POST /api/tasks/{id}/cancel`. Both take `RowVersion`. A conflict returns 409.
- Cancel of a PendingApproval task stops the approval cycle.
- Domain unit tests for every row of requirements 4.2.

**Frontend**
- Status action buttons on task detail. Only the actions this user can do.
- Kanban view with 4 columns (D25) next to the table.
- On 409: "Changed by someone else, reload".

**Rules:** BR11, BR36 (cancel part), BR43, requirements 4.2.

**Done when**
- All transition tests pass.
- Approved to Done returns 409.
- Backward moves are Dept Manager only.
- Rejected and Cancelled are final.
- Cancelling a PendingApproval task stops the cycle: no more ApprovalNeeded, approve returns 409.

---

## Slice 12. Reassign

**Goal:** A task is given to another member. The new assignee is notified.

**Backend**
- No DB change.
- `POST /api/tasks/{id}/reassign` with `RowVersion`.
- Assigned notification on reassign.
- Domain and integration tests.

**Frontend**
- Reassign modal on task detail, with only eligible members.

**Rules:** BR9, BR44.

**Done when**
- The new assignee gets an Assigned notification.
- Reassigning a PendingApproval task returns 409.
- Reassigning to a non-member returns 400.

---

## Slice 13. Edit Priority and Due date

**Goal:** The Dept Manager edits Priority and DueDate after approval.

**Backend**
- No DB change.
- `PUT /api/tasks/{id}`: Priority and DueDate only, with `RowVersion`.
- Domain: Dept Manager only, Approved or InProgress only, no edit while PendingApproval.
- A DueDate change resets `OverdueNotifiedAt`.
- Domain and integration tests.

**Frontend**
- Edit modal on task detail. Handle 409.

**Rules:** BR15, BR34, BR16 (reset).

**Done when**
- BR15 and BR34 tests pass.
- A concurrent edit returns 409.

---

## Slice 14. Comments

**Goal:** Users comment on Tasks.

**Backend**
- DB: `Comments` table and index. Migration.
- `GET /api/tasks/{id}/comments`, `POST /api/tasks/{id}/comments`, `PUT /api/comments/{id}`, `DELETE /api/comments/{id}`.
- No comments on Sub-tasks. No comments by Admin.
- NewComment notification.
- Integration tests.

**Frontend**
- Comment thread on task detail. Edit and delete for own comments.

**Rules:** BR29, BR30, BR31.

**Done when**
- All tests of these rules pass.
- Delete removes the row.

---

## Slice 15. Filters, search, My tasks

**Goal:** Users find tasks fast.

**Backend**
- No DB change. Indexes exist.
- Task list filters: status, priority, assignee, due range, overdue. Text search on Title.
- `GET /api/tasks/mine`.
- Integration tests.

**Frontend**
- Filter bar on project tasks.
- `features/my-tasks` from `my-tasks.html`.

**Rules:** D11.

**Done when**
- Filters combine correctly.
- Paging and `totalCount` are right.

---

## Slice 16. Overdue job

**Goal:** One Overdue notification per open task after its due day ends in Cairo.

**Backend**
- No DB change. `OverdueNotifiedAt` exists.
- `BackgroundService` with an hourly `PeriodicTimer` in Infrastructure (D8). "Today" in `Africa/Cairo`.
- Conditional update: set `OverdueNotifiedAt` only when it is still null.
- Date logic in a testable method with a fake `IClock`.

**Frontend**
- Overdue badge in lists and on task detail.

**Rules:** BR16.

**Done when**
- BR16 tests pass, including the 23:59 and 00:00 Cairo edge and the single notification case.

---

## Slice 17. Sub-tasks

**Goal:** Tasks get Sub-tasks with their own assignee, status, and due date.

**Blocked by:** OQ5, OQ8.

**Backend**
- No DB change. Table and check constraint exist.
- `POST /api/tasks/{id}/subtasks`: no Priority, parent's ProjectId, one level only.
- Due date checks against the parent.
- Parent auto Done, move back, and cancel in the Application service, in one transaction.
- Same approval rules. Junior rule BR45.
- Domain and integration tests.

**Frontend**
- Sub-task list on task detail.
- Sub-task create and the page from `subtask-detail.html`.

**Rules:** BR12, BR13, BR37, BR38, BR39, BR45.

**Done when**
- All tests of these rules pass.

---

## Slice 18. Archive and read only Project

**Goal:** The Dept Manager archives a finished Project. It becomes read only.

**Blocked by:** OQ5.

**Backend**
- No DB change.
- `POST /api/projects/{id}/archive`: Dept Manager only, all tasks Done or Cancelled.
- One "Project is active" guard called by every write path: tasks, approvals, comments, members. One test per path.

**Frontend**
- Archive button. "Archived" banner. All write actions disabled.

**Rules:** BR5, BR6, BR42.

**Done when**
- Every write on an Archived Project returns 409.
- Reads return 200.

---

## Slice 19. Admin edits users

**Goal:** Admin edits a user's name, email, role, and Department.

**Blocked by:** OQ10, OQ11.

**Backend**
- No DB change.
- `PUT /api/users/{id}` with BR48 validators and the chosen side effect rules.
- Integration tests.

**Frontend**
- Edit user modal on the users screen.

**Rules:** BR48, D23.

**Done when**
- BR48 tests pass, plus tests for the chosen side effects.
