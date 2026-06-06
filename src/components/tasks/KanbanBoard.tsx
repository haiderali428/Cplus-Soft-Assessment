"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  defaultDropAnimationSideEffects,
  type CollisionDetection,
  type DropAnimation,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Search } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchTasks, updateTask, deleteTask, reorderTasksOptimistic } from "@/store/tasksSlice";
import { setEditingTask } from "@/store/uiSlice";
import { useUsers } from "@/hooks/useUsers";
import { Task, TaskStatus } from "@/types";
import { KanbanColumn, type KanbanColumnDef } from "./KanbanColumn";
import { TaskCardInner } from "./TaskCard";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";

// Column definitions──────────────────────────────────────────────────

export const COLUMNS: KanbanColumnDef[] = [
  { status: "backlog",    label: "Backlog",      color: "#768396" },
  { status: "todo",       label: "Todo",         color: "#1EA7FF" },
  { status: "inprogress", label: "In Progress",  color: "#F59E0B" },
  { status: "review_qa",  label: "Review & QA",  color: "#5051F9" },
  { status: "rejection",  label: "Rejection",    color: "#EF4444" },
  { status: "completed",  label: "Completed",    color: "#10B981" },
];

const COLUMN_STATUSES = new Set<string>(COLUMNS.map((c) => c.status));

// Collision detection─────────────────────────────────────────────────

const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return rectIntersection(args);
};

// Drop animation──────────────────────────────────────────────────────

const dropAnimation: DropAnimation = {
  duration: 180,
  easing:   "ease",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0" } },
  }),
};

// Reorder helper──────────────────────────────────────────────────────

function recompute(tasks: Task[], activeId: string, overId: string): Task[] | null {
  const activeIdx = tasks.findIndex((t) => t.id === activeId);
  if (activeIdx === -1) return null;

  const active = tasks[activeIdx];

  if (COLUMN_STATUSES.has(overId)) {
    const newStatus = overId as TaskStatus;
    if (active.status === newStatus) return null;
    return tasks.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t));
  }

  const overIdx = tasks.findIndex((t) => t.id === overId);
  if (overIdx === -1 || activeIdx === overIdx) return null;

  const over = tasks[overIdx];

  if (active.status === over.status) {
    return arrayMove(tasks, activeIdx, overIdx);
  }

  const without  = tasks.filter((t) => t.id !== activeId);
  const insertAt = without.findIndex((t) => t.id === overId);
  const moved    = { ...active, status: over.status as TaskStatus };
  without.splice(insertAt === -1 ? without.length : insertAt, 0, moved);
  return without;
}

// Board component─────────────────────────────────────────────────────

export function KanbanBoard() {
  const dispatch = useAppDispatch();

  const { items: tasks, loading, error } = useAppSelector((s) => s.tasks);
  const searchQuery  = useAppSelector((s) => s.ui.searchQuery);
  const taskFilter   = useAppSelector((s) => s.ui.taskFilter);
  const currentUser   = useAppSelector((s) => s.auth.user);
  const currentUserId = currentUser?.id;
  const isAdmin       = currentUser?.role === "admin";

  const { users } = useUsers();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const tasksRef    = useRef<Task[]>(tasks);
  const snapshotRef = useRef<Task[]>([]);

  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { dispatch(fetchTasks()); }, [dispatch]);

  // Filtering (search + My Tasks)──────────────────────────────────

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (taskFilter === "mine" && currentUser) {
      result = result.filter((t) => t.assignedUser === currentUser.id);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false)
      );
    }

    return result;
  }, [tasks, taskFilter, searchQuery, currentUser]);

  const isFiltered    = taskFilter === "mine" || searchQuery.trim() !== "";
  const noResults     = isFiltered && filteredTasks.length === 0;

  // DnD sensors─────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    snapshotRef.current = [...tasksRef.current];
    const found = tasksRef.current.find((t) => t.id === event.active.id);
    setActiveTask(found ?? null);
  }, []);

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const next = recompute(tasksRef.current, active.id as string, over.id as string);
      if (next) dispatch(reorderTasksOptimistic(next));
    },
    [dispatch]
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) {
        dispatch(reorderTasksOptimistic(snapshotRef.current));
        return;
      }

      const current  = tasksRef.current.find((t) => t.id === active.id);
      const original = snapshotRef.current.find((t) => t.id === active.id);

      if (current && original && current.status !== original.status) {
        const result = await dispatch(
          updateTask({ id: current.id, data: { status: current.status } })
        );
        if (updateTask.rejected.match(result)) {
          dispatch(reorderTasksOptimistic(snapshotRef.current));
        }
      }
    },
    [dispatch]
  );

  const onDragCancel = useCallback(() => {
    dispatch(reorderTasksOptimistic(snapshotRef.current));
    setActiveTask(null);
  }, [dispatch]);

  const onEdit = useCallback(
    (task: Task) => { dispatch(setEditingTask(task)); },
    [dispatch]
  );

  const onDelete = useCallback(
    async (task: Task) => {
      const result = await dispatch(deleteTask(task.id));
      if (deleteTask.fulfilled.match(result)) {
        toast.success("Task deleted");
      } else {
        toast.error("Failed to delete task");
      }
    },
    [dispatch]
  );

  // Loading / error─────────────────────────────────────────────────

  if (loading && tasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm" style={{ color: "var(--color-desc)" }}>
          Loading tasks…
        </span>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          message={`Could not load tasks: ${error}. Make sure the mock server is running (npm run mock).`}
        />
      </div>
    );
  }

  // Board─

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {/* No-results empty state */}
      {noResults && (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Search size={28} style={{ color: "var(--color-desc)" }} aria-hidden />
          <p className="text-sm font-medium" style={{ color: "var(--color-heading)" }}>
            No tasks match
            {searchQuery.trim() ? ` "${searchQuery.trim()}"` : ""}
            {taskFilter === "mine" ? " assigned to you" : ""}
          </p>
          <p className="text-xs" style={{ color: "var(--color-desc)" }}>
            Try a different search or switch to All Tasks.
          </p>
        </div>
      )}

      {/* Columns */}
      <div className="flex gap-5 px-6 pb-10 pt-5" style={{ width: "max-content" }}>
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            column={col}
            tasks={filteredTasks.filter((t) => t.status === col.status)}
            users={users}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Drag overlay */}
      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask && (
          <div className="rotate-[1.5deg] scale-[1.03] drop-shadow-2xl">
            <TaskCardInner task={activeTask} users={users} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
