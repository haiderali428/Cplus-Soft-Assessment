# TaskFlow — API Test Reference (Postman)

All requests use `Content-Type: application/json`.  
Replace `{{base}}` with your environment URL:

| Environment | Base URL |
|---|---|
| Local | `http://localhost:3000` |
| Production | `https://cplus-soft-assessment.vercel.app` |

---

## Health Check

### GET /api/health
Verify MongoDB is connected and return document counts.

```
GET {{base}}/api/health
```

**Response 200**
```json
{
  "connected": true,
  "database": "taskflow",
  "collections": {
    "tasks": 5,
    "projects": 3,
    "users": 5
  }
}
```

**Response 500 — MONGODB_URI not set**
```json
{
  "connected": false,
  "error": "MONGODB_URI environment variable is not set."
}
```

---

## Users

### GET /api/users
Get all users.

```
GET {{base}}/api/users
```

**Response 200**
```json
[
  {
    "id": "user-admin-01",
    "name": "Admin",
    "email": "admin@taskflow.dev",
    "role": "admin",
    "avatarUrl": "https://i.pravatar.cc/150?u=admin@taskflow.dev",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### GET /api/users?email=admin@taskflow.dev
Find a user by email (used internally by login).

```
GET {{base}}/api/users?email=admin@taskflow.dev
```

**Response 200**
```json
[
  {
    "id": "user-admin-01",
    "name": "Admin",
    "email": "admin@taskflow.dev",
    "role": "admin"
  }
]
```

---

### GET /api/users/:id
Get a single user by ID.

```
GET {{base}}/api/users/user-admin-01
```

**Response 200**
```json
{
  "id": "user-admin-01",
  "name": "Admin",
  "email": "admin@taskflow.dev",
  "role": "admin"
}
```

**Response 404**
```json
{ "error": "User not found" }
```

---

### POST /api/users
Create a new user (register).

```
POST {{base}}/api/users
Content-Type: application/json
```

**Body**
```json
{
  "id": "user-john-01",
  "name": "John Doe",
  "email": "john@taskflow.dev",
  "password": "password123",
  "role": "member",
  "avatarUrl": "https://i.pravatar.cc/150?u=john@taskflow.dev",
  "createdAt": "2026-06-07T00:00:00.000Z",
  "updatedAt": "2026-06-07T00:00:00.000Z"
}
```

**Valid values**
- `role`: `"admin"` `"member"`

**Response 201**
```json
{
  "id": "user-john-01",
  "name": "John Doe",
  "email": "john@taskflow.dev",
  "role": "member"
}
```

**Response 409 — duplicate email**
```json
{ "error": "Email already in use" }
```

---

## Projects

### GET /api/projects
Get all projects (sorted by newest first).

```
GET {{base}}/api/projects
```

**Response 200**
```json
[
  {
    "id": "proj-001",
    "name": "Owners Inventory SaaS — Design",
    "description": "UI/UX design for the Owners Inventory SaaS platform.",
    "category": "design",
    "status": "active",
    "progress": 45,
    "ownerId": "user-admin-01",
    "memberIds": ["user-asim-01"],
    "createdBy": "user-admin-01",
    "createdAt": "2026-02-01T00:00:00.000Z",
    "updatedAt": "2026-05-15T00:00:00.000Z"
  }
]
```

---

### GET /api/projects/:id
Get a single project by ID.

```
GET {{base}}/api/projects/proj-001
```

**Response 200**
```json
{
  "id": "proj-001",
  "name": "Owners Inventory SaaS — Design",
  "category": "design",
  "status": "active",
  "progress": 45,
  "ownerId": "user-admin-01",
  "memberIds": ["user-asim-01"],
  "createdAt": "2026-02-01T00:00:00.000Z",
  "updatedAt": "2026-05-15T00:00:00.000Z"
}
```

**Response 404**
```json
{ "error": "Project not found" }
```

---

### POST /api/projects
Create a new project.

```
POST {{base}}/api/projects
Content-Type: application/json
```

**Body**
```json
{
  "id": "proj-new-001",
  "name": "New Website Redesign",
  "description": "Complete redesign of the company website.",
  "category": "design",
  "status": "active",
  "progress": 0,
  "ownerId": "user-admin-01",
  "memberIds": ["user-asim-01", "user-ali-01"],
  "createdBy": "user-admin-01",
  "createdAt": "2026-06-07T00:00:00.000Z",
  "updatedAt": "2026-06-07T00:00:00.000Z"
}
```

**Valid values**
- `category`: `"design"` `"research"` `"development"` `"planning"`
- `status`: `"active"` `"onhold"` `"completed"`
- `progress`: integer `0` – `100`

**Response 201**
```json
{
  "id": "proj-new-001",
  "name": "New Website Redesign",
  "category": "design",
  "status": "active",
  "progress": 0,
  "ownerId": "user-admin-01",
  "memberIds": ["user-asim-01", "user-ali-01"],
  "createdAt": "2026-06-07T00:00:00.000Z",
  "updatedAt": "2026-06-07T00:00:00.000Z"
}
```

---

### PATCH /api/projects/:id
Update a project — send only the fields to change.

```
PATCH {{base}}/api/projects/proj-new-001
Content-Type: application/json
```

**Body**
```json
{
  "status": "completed",
  "progress": 100,
  "updatedAt": "2026-06-07T12:00:00.000Z"
}
```

**Response 200** — returns the full updated document
```json
{
  "id": "proj-new-001",
  "name": "New Website Redesign",
  "status": "completed",
  "progress": 100,
  "updatedAt": "2026-06-07T12:00:00.000Z"
}
```

**Response 404**
```json
{ "error": "Project not found" }
```

---

### DELETE /api/projects/:id
Delete a project permanently.

```
DELETE {{base}}/api/projects/proj-new-001
```

**Response 200**
```json
{ "success": true }
```

**Response 404**
```json
{ "error": "Project not found" }
```

---

## Tasks

### GET /api/tasks
Get all tasks (sorted by newest first).

```
GET {{base}}/api/tasks
```

**Response 200**
```json
[
  {
    "id": "task-001",
    "title": "Design dashboard layout",
    "description": "Create high-fidelity wireframes for the main dashboard.",
    "category": "design",
    "priority": "high",
    "dueDate": "2026-07-10",
    "assignedUser": "user-asim-01",
    "status": "inprogress",
    "projectId": "proj-001",
    "createdBy": "user-admin-01",
    "createdAt": "2026-02-05T00:00:00.000Z",
    "updatedAt": "2026-05-20T00:00:00.000Z"
  }
]
```

---

### GET /api/tasks/:id
Get a single task by ID.

```
GET {{base}}/api/tasks/task-001
```

**Response 200**
```json
{
  "id": "task-001",
  "title": "Design dashboard layout",
  "category": "design",
  "priority": "high",
  "status": "inprogress",
  "assignedUser": "user-asim-01",
  "projectId": "proj-001",
  "createdAt": "2026-02-05T00:00:00.000Z",
  "updatedAt": "2026-05-20T00:00:00.000Z"
}
```

**Response 404**
```json
{ "error": "Task not found" }
```

---

### POST /api/tasks
Create a new task.

```
POST {{base}}/api/tasks
Content-Type: application/json
```

**Body**
```json
{
  "id": "task-new-001",
  "title": "Build login page UI",
  "description": "Implement the login form with email and password validation.",
  "category": "development",
  "priority": "high",
  "dueDate": "2026-07-15",
  "assignedUser": "user-ali-01",
  "status": "todo",
  "projectId": "proj-new-001",
  "createdBy": "user-admin-01",
  "createdAt": "2026-06-07T00:00:00.000Z",
  "updatedAt": "2026-06-07T00:00:00.000Z"
}
```

**Valid values**
- `category`: `"design"` `"research"` `"development"` `"planning"`
- `priority`: `"low"` `"medium"` `"high"`
- `status`: `"backlog"` `"todo"` `"inprogress"` `"review_qa"` `"rejection"` `"completed"`

**Response 201**
```json
{
  "id": "task-new-001",
  "title": "Build login page UI",
  "category": "development",
  "priority": "high",
  "status": "todo",
  "assignedUser": "user-ali-01",
  "projectId": "proj-new-001",
  "createdAt": "2026-06-07T00:00:00.000Z",
  "updatedAt": "2026-06-07T00:00:00.000Z"
}
```

---

### PATCH /api/tasks/:id
Update a task — send only the fields to change.

```
PATCH {{base}}/api/tasks/task-new-001
Content-Type: application/json
```

**Body**
```json
{
  "status": "inprogress",
  "updatedAt": "2026-06-07T12:00:00.000Z"
}
```

**Response 200** — returns the full updated document
```json
{
  "id": "task-new-001",
  "title": "Build login page UI",
  "status": "inprogress",
  "updatedAt": "2026-06-07T12:00:00.000Z"
}
```

**Response 404**
```json
{ "error": "Task not found" }
```

---

### DELETE /api/tasks/:id
Delete a task permanently.

```
DELETE {{base}}/api/tasks/task-new-001
```

**Response 200**
```json
{ "success": true }
```

**Response 404**
```json
{ "error": "Task not found" }
```

---

## Postman Setup Guide

1. Open Postman → click **Environments** (top right) → **Add**
2. Name it `TaskFlow Local` — add variable:
   - Key: `base` | Value: `http://localhost:3000`
3. Duplicate the environment, name it `TaskFlow Production`, change `base` to `https://cplus-soft-assessment.vercel.app`
4. Create a **Collection** named `TaskFlow API` with four folders: `Health`, `Users`, `Projects`, `Tasks`
5. On the **Collection** level → **Headers** tab → add:
   - `Content-Type` : `application/json`
6. Always run `GET {{base}}/api/health` first to confirm the database is reachable before testing other endpoints
