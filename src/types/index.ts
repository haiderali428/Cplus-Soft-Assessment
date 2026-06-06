// Enums / union literals──────────────────────────────────────────────

export type Category = "design" | "planning" | "research" | "development";

export type ProjectStatus = "active" | "onhold" | "completed";

export type TaskStatus =
  | "backlog"
  | "todo"
  | "inprogress"
  | "review_qa"
  | "rejection"
  | "completed";

export type Priority = "low" | "medium" | "high";

export type UserRole = "admin" | "member";

// Domain models───────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  category: Category;
  status: ProjectStatus;
  /** 0–100 */
  progress: number;
  ownerId: string;
  memberIds: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  bannerImage?: string;
  priority: Priority;
  dueDate?: string;
  /** references User.id */
  assignedUser?: string;
  status: TaskStatus;
  projectId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// API payload helpers─────────────────────────────────────────────────

export type CreateTaskPayload = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export type CreateProjectPayload = Omit<Project, "id" | "createdAt" | "updatedAt">;
export type UpdateProjectPayload = Partial<CreateProjectPayload>;

// Auth─────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
