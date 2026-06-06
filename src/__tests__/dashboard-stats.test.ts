import { describe, it, expect } from "vitest";
import { computeDashboardStats } from "@/lib/stats";
import type { Task, Project } from "@/types";

// Helpers───

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id:           "t1",
    title:        "Test task",
    description:  "",
    status:       "todo",
    priority:     "medium",
    category:     "design",
    projectId:    "p1",
    assignedUser: "u1",
    dueDate:      "2026-12-31",
    createdAt:    "2026-01-01",
    updatedAt:    "2026-01-01",
    ...overrides,
  };
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id:          "p1",
    name:        "Test project",
    description: "",
    status:      "active",
    category:    "design",
    progress:    0,
    ownerId:     "u1",
    memberIds:   [],
    createdAt:   "2026-01-01",
    updatedAt:   "2026-01-01",
    ...overrides,
  };
}

// computeDashboardStats───────────────────────────────────────────────

describe("computeDashboardStats", () => {
  it("returns zeros for empty arrays", () => {
    expect(computeDashboardStats([], [])).toEqual({
      totalProjects:  0,
      totalTasks:     0,
      completedTasks: 0,
      pendingTasks:   0,
    });
  });

  it("counts totalProjects correctly", () => {
    const projects = [makeProject(), makeProject({ id: "p2" }), makeProject({ id: "p3" })];
    expect(computeDashboardStats([], projects).totalProjects).toBe(3);
  });

  it("counts totalTasks correctly", () => {
    const tasks = [makeTask(), makeTask({ id: "t2" }), makeTask({ id: "t3" })];
    expect(computeDashboardStats(tasks, []).totalTasks).toBe(3);
  });

  it("counts completedTasks as tasks in 'completed' status only", () => {
    const tasks = [
      makeTask({ id: "t1", status: "completed"  }),
      makeTask({ id: "t2", status: "completed"  }),
      makeTask({ id: "t3", status: "review_qa"  }),
      makeTask({ id: "t4", status: "inprogress" }),
    ];
    expect(computeDashboardStats(tasks, []).completedTasks).toBe(2);
  });

  it("does NOT count review_qa as completed", () => {
    const tasks = [
      makeTask({ id: "t1", status: "review_qa" }),
      makeTask({ id: "t2", status: "rejection" }),
    ];
    expect(computeDashboardStats(tasks, []).completedTasks).toBe(0);
  });

  it("counts pendingTasks as every status except 'completed'", () => {
    const tasks = [
      makeTask({ id: "t1", status: "backlog"    }),
      makeTask({ id: "t2", status: "todo"       }),
      makeTask({ id: "t3", status: "inprogress" }),
      makeTask({ id: "t4", status: "review_qa"  }),
      makeTask({ id: "t5", status: "rejection"  }),
      makeTask({ id: "t6", status: "completed"  }),
    ];
    expect(computeDashboardStats(tasks, []).pendingTasks).toBe(5);
  });

  it("handles a mixed realistic snapshot correctly", () => {
    const projects = [makeProject(), makeProject({ id: "p2" })];
    const tasks = [
      makeTask({ id: "t1", status: "backlog"   }),
      makeTask({ id: "t2", status: "todo"      }),
      makeTask({ id: "t3", status: "completed" }),
      makeTask({ id: "t4", status: "completed" }),
      makeTask({ id: "t5", status: "rejection" }),
    ];
    expect(computeDashboardStats(tasks, projects)).toEqual({
      totalProjects:  2,
      totalTasks:     5,
      completedTasks: 2,
      pendingTasks:   3,
    });
  });
});
