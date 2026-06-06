import { Task, Project } from "@/types";

export interface DashboardStats {
  totalProjects:  number;
  totalTasks:     number;
  /** Tasks in the "completed" status */
  completedTasks: number;
  /** Tasks that are NOT in the "completed" status */
  pendingTasks:   number;
}

export function computeDashboardStats(tasks: Task[], projects: Project[]): DashboardStats {
  return {
    totalProjects:  projects.length,
    totalTasks:     tasks.length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
    pendingTasks:   tasks.filter((t) => t.status !== "completed").length,
  };
}
