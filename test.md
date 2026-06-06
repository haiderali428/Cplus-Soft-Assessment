# Postman API Test Data

**Base URL (local):** `http://localhost:3000`  
**Base URL (Vercel):** `https://your-vercel-url.vercel.app`

All requests use:
```
Content-Type: application/json
```

---

## Users

### GET all users
```
GET /api/users
```
No body needed.

---

### GET users filtered by email
```
GET /api/users?email=admin@gmail.com
```
No body needed.

---

### GET user by ID
```
GET /api/users/u1
```
No body needed.

Try these IDs: `u1` `u2` `u3` `u4`

---

### POST create new user
```
POST /api/users
```
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "password123",
  "role": "member",
  "avatarUrl": "https://i.pravatar.cc/150?img=60"
}
```

Admin user:
```json
{
  "name": "Sara Admin",
  "email": "sara@gmail.com",
  "password": "password123",
  "role": "admin",
  "avatarUrl": "https://i.pravatar.cc/150?img=20"
}
```

---

---

## Projects

### GET all projects
```
GET /api/projects
```
No body needed.

---

### GET project by ID
```
GET /api/projects/{id}
```
Replace `{id}` with an ID returned from the POST below.

---

### POST create project
```
POST /api/projects
```

Design project:
```json
{
  "name": "Website Redesign",
  "description": "Complete redesign of the company website with new branding.",
  "category": "design",
  "status": "active",
  "progress": 30,
  "ownerId": "u1",
  "memberIds": ["u1", "u2", "u3"],
  "createdBy": "u1"
}
```

Planning project:
```json
{
  "name": "Q3 Product Roadmap",
  "description": "Plan and prioritize features for Q3 release.",
  "category": "planning",
  "status": "active",
  "progress": 10,
  "ownerId": "u2",
  "memberIds": ["u2", "u4"],
  "createdBy": "u2"
}
```

Research project:
```json
{
  "name": "User Research Study",
  "description": "Conduct interviews and usability testing with 20 users.",
  "category": "research",
  "status": "onhold",
  "progress": 60,
  "ownerId": "u3",
  "memberIds": ["u3", "u4"],
  "createdBy": "u3"
}
```

Development project:
```json
{
  "name": "Mobile App v2",
  "description": "Build the second version of the mobile application.",
  "category": "development",
  "status": "completed",
  "progress": 100,
  "ownerId": "u1",
  "memberIds": ["u1", "u2", "u3", "u4"],
  "createdBy": "u1"
}
```

---

### PATCH update project
```
PATCH /api/projects/{id}
```

Update status and progress:
```json
{
  "status": "onhold",
  "progress": 75
}
```

Update name and description:
```json
{
  "name": "Website Redesign — Phase 2",
  "description": "Continuing the redesign with focus on mobile responsiveness."
}
```

Mark as completed:
```json
{
  "status": "completed",
  "progress": 100
}
```

---

### DELETE project
```
DELETE /api/projects/{id}
```
No body needed.

---

---

## Tasks

### GET all tasks
```
GET /api/tasks
```
No body needed.

---

### GET task by ID
```
GET /api/tasks/{id}
```
Replace `{id}` with an ID returned from the POST below.

---

### POST create task

> `projectId` must be an ID from an existing project. Run POST /api/projects first and copy the returned `id`.

Backlog task:
```json
{
  "title": "Set up project repository",
  "description": "Initialize Git repo, add .gitignore, README, and branch protection rules.",
  "category": "development",
  "priority": "high",
  "status": "backlog",
  "projectId": "{projectId}",
  "assignedUser": "u2",
  "createdBy": "u1"
}
```

Todo task:
```json
{
  "title": "Design landing page wireframes",
  "description": "Create low-fidelity wireframes for the new landing page in Figma.",
  "category": "design",
  "priority": "medium",
  "status": "todo",
  "projectId": "{projectId}",
  "assignedUser": "u3",
  "dueDate": "2026-07-15",
  "bannerImage": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
  "createdBy": "u2"
}
```

In Progress task:
```json
{
  "title": "Implement authentication flow",
  "description": "Build login, register, and forgot password pages with JWT auth.",
  "category": "development",
  "priority": "high",
  "status": "inprogress",
  "projectId": "{projectId}",
  "assignedUser": "u1",
  "dueDate": "2026-06-30",
  "createdBy": "u1"
}
```

Review & QA task:
```json
{
  "title": "Review API documentation",
  "description": "Check all endpoint docs for accuracy and completeness.",
  "category": "research",
  "priority": "low",
  "status": "review_qa",
  "projectId": "{projectId}",
  "assignedUser": "u4",
  "dueDate": "2026-06-20",
  "createdBy": "u3"
}
```

Rejection task:
```json
{
  "title": "Add animated onboarding screen",
  "description": "Client rejected the animation — needs to be redesigned.",
  "category": "design",
  "priority": "medium",
  "status": "rejection",
  "projectId": "{projectId}",
  "assignedUser": "u2",
  "createdBy": "u2"
}
```

Completed task:
```json
{
  "title": "Set up CI/CD pipeline",
  "description": "Configure GitHub Actions for automated testing and Vercel deployment.",
  "category": "development",
  "priority": "high",
  "status": "completed",
  "projectId": "{projectId}",
  "assignedUser": "u1",
  "dueDate": "2026-06-10",
  "bannerImage": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
  "createdBy": "u1"
}
```

Task with no assigned user:
```json
{
  "title": "Write unit tests for dashboard stats",
  "description": "Cover all branches of computeDashboardStats with Vitest.",
  "category": "development",
  "priority": "low",
  "status": "todo",
  "projectId": "{projectId}",
  "createdBy": "u4"
}
```

Planning task with banner:
```json
{
  "title": "Sprint planning session",
  "description": "Define stories, assign points, and set goals for the upcoming sprint.",
  "category": "planning",
  "priority": "medium",
  "status": "todo",
  "projectId": "{projectId}",
  "assignedUser": "u3",
  "dueDate": "2026-07-01",
  "bannerImage": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
  "createdBy": "u2"
}
```

---

### PATCH update task

Update status only (drag-drop equivalent):
```json
{
  "status": "inprogress"
}
```

Update priority and due date:
```json
{
  "priority": "high",
  "dueDate": "2026-07-01"
}
```

Assign to a different user:
```json
{
  "assignedUser": "u3"
}
```

Update title and description:
```json
{
  "title": "Redesign landing page wireframes",
  "description": "Updated scope — include mobile and tablet breakpoints."
}
```

Mark as completed:
```json
{
  "status": "completed"
}
```

---

### DELETE task
```
DELETE /api/tasks/{id}
```
No body needed.

---

---

## Quick Reference

### Valid field values

**category**
```
design | planning | research | development
```

**status (task)**
```
backlog | todo | inprogress | review_qa | rejection | completed
```

**priority**
```
low | medium | high
```

**status (project)**
```
active | onhold | completed
```

**role (user)**
```
admin | member
```

---

### Seeded users (always available)

| ID | Name | Email | Role |
|---|---|---|---|
| u1 | Admin | admin@gmail.com | admin |
| u2 | Ali Rao | alirao@gmail.com | member |
| u3 | Umar Awan | umar@gmail.com | member |
| u4 | Asim Shabir | asim2003@gmail.com | member |

---

### Recommended test order

1. `POST /api/projects` → copy the returned `id`
2. `POST /api/tasks` → paste the project `id` into `projectId`
3. `GET /api/tasks` → verify task was created
4. `PATCH /api/tasks/{id}` → update status
5. `GET /api/tasks/{id}` → verify update
6. `DELETE /api/tasks/{id}` → delete task
7. `GET /api/tasks/{id}` → expect `404 Not Found`
8. `DELETE /api/projects/{id}` → delete project
9. `GET /api/projects/{id}` → expect `404 Not Found`
