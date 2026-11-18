# Business Rules

Each rule has an ID, the rule, and at least one test.
Tests use "Given / When / Then". Expected HTTP codes follow [architecture.md](architecture.md).
Tests are paused for now (D48). Use the Given / When / Then lines as manual checks in the browser or Swagger.

Rule IDs never change. A removed rule keeps its ID and is marked Removed.

Terms:
- **Dept Manager**: the Manager of the Project's Department.
- **Direct Manager**: the Manager of the user's own Department.
- **Member**: a user in the Project's ProjectMembers.
- **Open task**: Status is PendingApproval, Approved, or InProgress.
- **Closed task**: Status is Done, Rejected, or Cancelled.

## Projects and members

### BR1. Who creates Projects
- Rule: Only a Manager or a Senior can create a Project.
- Test: Given a Junior, when he creates a Project, then 403.
- Test: Given a Senior, when he creates a Project, then 201.

### BR2. Project Department
- Rule: A Senior's Project gets his own Department. A Manager must pick one of the Departments he manages.
- Test: Given a Senior in Dept A, when he creates a Project, then its DepartmentId is A, whatever the request sends.
- Test: Given a Manager of Depts A and B, when he creates a Project in Dept C, then 403.

### BR3. Who adds members
- Rule: A Manager adds any user from a Department he manages to that Department's Projects. A Senior adds only users from his own Department, to Projects of his Department that he is a member of.
- Rule: Only Seniors and Juniors can be members.
- Test: Given a Manager of Dept A, when he adds a Dept B user to a Dept A Project, then 400.
- Test: Given a Senior in Dept A, when he adds a Dept A user to a Dept A Project he is not a member of, then 404.
- Test: Given a user who is already a member, when he is added again, then 409.

### BR4. Auto membership
- Rule: A Senior who creates a Project becomes a member automatically. A Manager does not.
- Test: Given a Senior, when he creates a Project, then he is in its members.
- Test: Given a Manager, when he creates a Project, then the Project has no members.

### BR5. Who archives
- Rule: Only the Dept Manager can archive a Project.
- Test: Given a Senior member, when he archives the Project, then 403.
- Test: Given a Manager of another Department, when he archives the Project, then 404.

### BR6. Archive condition
- Rule: A Project can be archived only when every TaskItem in it is Done or Cancelled. See OQ5.
- Test: Given a Project with one InProgress task, when the Dept Manager archives it, then 409.
- Test: Given a Project where all tasks are Done or Cancelled, when the Dept Manager archives it, then Status is Archived.
- Test: Given a Project with no tasks, when the Dept Manager archives it, then Status is Archived.

### BR7. No delete
- Rule: Projects and TaskItems are never deleted. Use Cancelled and Archived.
- Test: The API has no DELETE endpoint for Projects or TaskItems.

### BR35. Remove a member
- Rule: A user who can add a member (BR3) can remove him.
- Rule: A member can be removed only when no TaskItem in the Project is assigned to him, in any status, and he has no Pending approval on a TaskItem of the Project.
- Test: Given a member with one Done task in the Project, when he is removed, then 409.
- Test: Given a member with a Pending approval in the Project, when he is removed, then 409.
- Test: Given a member with no tasks and no Pending approvals, when he is removed, then his ProjectMembers row is deleted.

### BR42. Archived Project is read only
- Rule: In an Archived Project, nobody can create or change TaskItems, approvals, comments, or members.
- Test: Given an Archived Project, when a member adds a comment, then 409.
- Test: Given an Archived Project, when the Dept Manager adds a member, then 409.
- Test: Given an Archived Project, when a member opens a task, then 200.

## Tasks and sub-tasks

### BR8. Assignees
- Rule: A Task has exactly one assignee. A Sub-task has its own assignee, status, and optional due date.
- Test: Given a create request without an assignee, then 400.

### BR9. Assignment scope
- Rule: The assignee must be a member of the Project.
- Rule: A Manager assigns and reassigns in his Departments' Projects. A Senior assigns and reassigns in Projects he is a member of.
- Test: Given a Senior member, when he assigns a task to a non-member, then 400.
- Test: Given a Junior, when he reassigns a task, then 403.

### BR10. Junior tasks
- Rule: A Junior creates tasks only in Projects he is a member of, and only with himself as assignee.
- Rule: He must pick at least one approver. Each approver is a Manager, or a Senior who is a member of the Project. His Direct Manager is not forced.
- Test: Given a Junior, when he creates a task for another member, then 403.
- Test: Given a Junior, when he creates a task with no approvers, then 400.
- Test: Given a Junior, when he picks a Senior who is not a member as approver, then 400.
- Test: Given a Junior, when he picks any Manager as approver, then 201 and Status is PendingApproval.

### BR45. Junior sub-tasks
- Rule: A Junior can add Sub-tasks only to a Task he created. Each Sub-task is assigned to himself and needs at least one approver, like BR10.
- Test: Given a Junior, when he adds a Sub-task to a task he did not create, then 403.
- Test: Given a Junior, when he adds a Sub-task assigned to another member, then 403.

### BR11. Who changes status
- Rule: Only the assignee moves his task forward: Approved to InProgress, InProgress to Done.
- Rule: Only the Dept Manager moves a task backward: InProgress to Approved, Done to InProgress, Done to Approved.
- Test: Given a member who is not the assignee, when he moves the task to InProgress, then 403.
- Test: Given a Senior assignee of a Done task, when he moves it to InProgress, then 403.
- Test: Given the Dept Manager, when he moves a Done task to InProgress, then 200.
- Test: Given any user, when he moves a task from Approved directly to Done, then 409.

### BR12. Parent auto Done
- Rule: A Task with Sub-tasks becomes Done automatically when every Sub-task is Done or Cancelled and at least one is Done. See OQ5.
- Rule: The assignee cannot set a Task with open Sub-tasks to Done by hand.
- Test: Given a Task with two Sub-tasks, one Done, when the other becomes Done, then the Task is Done.
- Test: Given a Task with one Done and one Cancelled Sub-task, then the Task is Done.
- Test: Given a Task whose only Sub-task is Cancelled, then the Task does not change.
- Test: Given a Task with an InProgress Sub-task, when the assignee sets the Task to Done, then 409.

### BR38. Parent moves back
- Rule: If a parent Task is Done and a Sub-task moves back from Done, the parent moves to InProgress automatically.
- Test: Given a Done parent, when the Dept Manager moves a Sub-task from Done to InProgress, then the parent is InProgress.

### BR37. When Sub-tasks can be added
- Rule: A Sub-task can be added only when the parent is Approved or InProgress.
- Rule: A Sub-task cannot have Sub-tasks.
- Test: Given a PendingApproval Task, when a Sub-task is added, then 409.
- Test: Given a Sub-task, when a Sub-task is added under it, then 400.

### BR39. Parent cancel
- Rule: When a parent Task is Cancelled, its open Sub-tasks become Cancelled too. See OQ8.
- Test: Given a Task with one InProgress and one Done Sub-task, when it is Cancelled, then the InProgress Sub-task is Cancelled and the Done one stays Done.

### BR13. Sub-task due date
- Rule: A Sub-task's DueDate cannot be later than its parent's DueDate.
- Rule: The parent's DueDate cannot be moved earlier than any Sub-task's DueDate.
- Rule: If the parent has no DueDate, a Sub-task's DueDate is free.
- Test: Given a parent due on 2026-12-10, when a Sub-task is created due on 2026-12-11, then 400.
- Test: Given a Sub-task due on 2026-12-10, when the Manager sets the parent due date to 2026-12-09, then 400.

### BR14. No move between Projects
- Rule: A TaskItem's ProjectId never changes. A Sub-task's ProjectId equals its parent's.
- Test: The update DTO has no ProjectId. A Sub-task created under a parent always gets the parent's ProjectId.

### BR15. Edit after approval
- Rule: When a task is Approved or InProgress, only the Dept Manager can edit it, and only its Priority and DueDate.
- Rule: Title and Description never change after creation.
- Rule: Done, Rejected, and Cancelled tasks cannot be edited.
- Test: Given an Approved task, when a Senior member edits its Priority, then 403.
- Test: Given an InProgress task, when the Dept Manager edits its Title, then 400.
- Test: Given an Approved task, when the Dept Manager edits its DueDate, then 200.

### BR34. No edit while pending
- Rule: While a task is PendingApproval, nobody can edit it. To fix it, an approver rejects it or the Dept Manager cancels it, and the creator creates a new task.
- Test: Given a PendingApproval task, when its creator edits the Title, then 409.

### BR43. Who cancels
- Rule: Only the Dept Manager can cancel a TaskItem. He can cancel it when it is PendingApproval, Approved, or InProgress.
- Test: Given the creator Senior, when he cancels his task, then 403.
- Test: Given the Dept Manager, when he cancels a Done task, then 409.

### BR44. When reassign is allowed
- Rule: Reassign is allowed only when the task is Approved or InProgress. It does not change approvals.
- Test: Given a PendingApproval task, when the Dept Manager reassigns it, then 409.
- Test: Given an InProgress task, when a Senior member reassigns it to another member, then 200 and the new assignee gets an Assigned notification.

### BR16. Overdue
- Rule: A task is overdue when its DueDate is before today's date in `Africa/Cairo` and its Status is PendingApproval, Approved, or InProgress.
- Rule: The system sends one Overdue notification to the assignee and to the Dept Manager, then sets OverdueNotifiedAt.
- Rule: When the DueDate changes, OverdueNotifiedAt is reset to null.
- Test: Given a task due on 2026-12-10, at 2026-12-10 23:59 Cairo time, then it is not overdue.
- Test: Given a task due on 2026-12-10, at 2026-12-11 00:00 Cairo time, then it is overdue.
- Test: Given an overdue task already notified, when the check runs again, then no new notification.
- Test: Given an overdue Done task, then no notification.
- Test: Given an assignee who is also the Dept Manager, then he gets one notification.

## Approvals

### BR17. Approver order
- Rule: A TaskItem can have many approvers. Each has a unique Order: 1, 2, 3, and so on. The order is set when the task is created.
- Rule: The same user cannot appear twice in one task's approvers.
- Test: Given a create request with the same approver twice, then 400.
- Test: Given a create request with approvers [A, B], then A has Order 1 and B has Order 2.

### BR33. Sequential approval
- Rule: Only the approver with the lowest Order whose approval is Pending can act. He is the current approver.
- Rule: The current approver gets an ApprovalNeeded notification when his turn starts.
- Test: Given approvers A(1) and B(2), when B approves first, then 409.
- Test: Given approvers A(1) and B(2), when the task is created, then only A gets ApprovalNeeded.
- Test: Given approvers A(1) and B(2), when A approves, then B gets ApprovalNeeded.

### BR18. Approved when all approve
- Rule: The task becomes Approved only when every approval is Approved.
- Test: Given approvers A(1) and B(2), when A approves, then the task is still PendingApproval.
- Test: Given approvers A(1) and B(2), when A then B approve, then the task is Approved, and the creator and assignee get an Approved notification.

### BR19. Direct Manager adds approvers
- Rule: When the Direct Manager of a Senior creator is the current approver on that Senior's task, he can approve and add more approvers in one action.
- Rule: Added approvers are other Managers, or Seniors who are members of the Project.
- Rule: Added approvers get the next Order numbers after the current highest Order.
- Test: Given a Senior's task with approvers M(1) and S(2), when M approves and adds X, then X has Order 3 and S is now the current approver.
- Test: Given a Senior's task, when a Manager who is not the Senior's Direct Manager tries to add approvers, then 403.
- Test: Given a Junior's task, when his Direct Manager tries to add approvers, then 403.

### BR20. Who can approve
- Rule: Only a Manager or a Senior can be an approver. A Senior approver must be a member of the Project. Admin and Junior never approve.
- Test: Given a create request with a Junior as approver, then 400.
- Test: Given a create request with a non-member Senior as approver, then 400.

### BR21. Senior to Senior
- Rule: When a Senior creates a task for another Senior, the approvers must include the Dept Manager.
- Test: Given a Senior who creates a task for another Senior with no approvers, then 400.
- Test: Given the same request with the Dept Manager as approver, then 201.

### BR22. Senior's own task
- Rule: A Senior's task for himself needs approval only if he adds approvers.
- Test: Given a Senior who creates a task for himself with no approvers, then Status is Approved.

### BR23. Senior to Junior
- Rule: A task a Senior creates for a Junior needs no approval by default. The Senior can add approvers.
- Test: Given a Senior who creates a task for a Junior with no approvers, then Status is Approved.

### BR24. Manager tasks
- Rule: A Manager who creates a task or sub-task chooses whether it needs approval and picks the approvers.
- Test: Given a Manager who creates a task with no approvers, then Status is Approved.

### BR25. No self approval
- Rule: The creator of a task can never be one of its approvers.
- Test: Given a Manager who lists himself as approver on his own task, then 400.
- Test: Given a Direct Manager who adds the task creator as approver, then 400.

### BR41. Assignee can be an approver
- Rule: The assignee of a task can be one of its approvers, if BR20 allows it (a Manager, or a Senior who is a member of the Project). Changed on 2026-11-18 (D32).
- Test: Given a Manager who creates a task for Senior B with B as approver, then 201.
- Test: Given that task, when B is the current approver and approves, then his approval is saved.

### BR26. Rejection
- Rule: When the current approver rejects, the task becomes Rejected. He can write a reason.
- Rule: Rejected is final. The creator cannot edit or resubmit.
- Test: Given approvers A(1) and B(2), when A rejects with a reason, then the task is Rejected, the reason is saved, and the creator and assignee get a Rejected notification.
- Test: Given a Rejected task, when anyone changes its status, then 409.

### BR36. Rejection stops the cycle
- Rule: After a rejection, the remaining Pending approvals can no longer be acted on, and no ApprovalNeeded is sent for them.
- Rule: The same applies when a PendingApproval task is Cancelled.
- Test: Given approvers A(1) and B(2), when A rejects, then B does not get ApprovalNeeded and B's approve returns 409.

### BR40. Approver visibility
- Rule: A user can view a TaskItem he is an approver on, even if he cannot see its Project. See OQ6.
- Test: Given a Manager of another Department who is an approver, when he opens the task, then 200.
- Test: Given the same Manager, when he opens another task in that Project, then 404.

## Users and comments

### BR27. Removed
- Removed on 2026-11-17. User deactivation is on the Later list.

### BR28. Removed
- Removed on 2026-11-17. User deactivation is on the Later list.

### BR46. Generated temporary password
- Rule: When Admin creates a user or resets a password, the system generates a temporary password that follows the Identity policy. The API returns it once. It is never shown again.
- Rule: After create or reset, `MustChangePassword` is true.
- Test: Given Admin, when he creates a user, then the response contains a temporary password and `MustChangePassword` is true.
- Test: Given Admin, when he resets a password, then the old password no longer signs in and the new temporary password does.
- Test: Given a Manager, when he resets a password, then 403.

### BR47. Department edit
- Rule: Admin can rename a Department. The name stays unique.
- Rule: Admin can change a Department's Manager to another user with the Manager role, or remove the Manager. See OQ11.
- Test: Given Departments A and B, when Admin renames B to A, then 400.
- Test: Given Admin, when he sets a Senior as a Department's Manager, then 400.
- Test: Given Admin, when he removes a Department's Manager, then its ManagerId is null.

### BR48. User edit
- Rule: Admin can edit a user's full name, email, role, and Department. Email stays unique. A Senior or Junior must have a Department. A Manager or Admin has none.
- Rule: The effect of a role or Department change on memberships, tasks, approvals, and managed Departments is open. See OQ10.
- Test: Given Admin, when he changes a user's email to one already used, then 400.
- Test: Given Admin, when he changes a Junior's role to Senior with no Department, then 400.
- Test: Given a Manager, when he edits a user, then 403.

### BR29. Who comments
- Rule: Anyone who can see a Task can comment on it, except Admin.
- Rule: Sub-tasks have no comments.
- Rule: A new comment sends NewComment to the task creator and assignee, except the author.
- Test: Given an Admin, when he comments, then 403.
- Test: Given a member, when he comments on a Sub-task, then 400.
- Test: Given a non-member Senior, when he comments, then 404.

### BR30. Own comments only
- Rule: A user edits and deletes only his own comments. Delete is a hard delete.
- Test: Given a comment by user A, when user B edits it, then 403.
- Test: Given a comment by user A, when A deletes it, then it is gone from the table.

### BR31. Simple comments
- Rule: No @mentions, no replies, no comment history.
- Test: The Comment entity has no ParentCommentId and no history table.

### BR32. Field values
- Rule: DueDate is a date with no time. Priority is Low, Medium, High, or Urgent.
- Test: Given a create request with Priority "Critical", then 400.
- Test: Given a Task create request without Priority, then 400.
- Test: Given a Sub-task create request with a Priority, then 400.
