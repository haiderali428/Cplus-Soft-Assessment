"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Task, User } from "@/types";
import { TaskCard } from "./TaskCard";
import { CardHeading } from "@/components/typography/CardHeading";

export interface KanbanColumnDef {
  status: string;
  label:  string;
  color:  string;
}

interface KanbanColumnProps {
  column:          KanbanColumnDef;
  tasks:           Task[];
  users:           User[];
  onEdit?:         (task: Task) => void;
  onDelete?:       (task: Task) => void;
  currentUserId?:  string;
  isAdmin?:        boolean;
}

export function KanbanColumn({ column, tasks, users, onEdit, onDelete, currentUserId, isAdmin }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  return (
    <div
      role="region"
      aria-label={`${column.label} column, ${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
      className="flex w-68 shrink-0 flex-col"
    >
      {/* Column header────────────────────────────────────────────── */}
      <div className="mb-3 flex items-center gap-2 px-1">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: column.color }}
          aria-hidden
        />
        <CardHeading as="h2" className="flex-1 text-[13px]! font-semibold">
          {column.label}
        </CardHeading>
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums"
          style={{
            background: `color-mix(in srgb, ${column.color} 15%, transparent)`,
            color:       column.color,
          }}
          aria-hidden
        >
          {tasks.length}
        </span>
      </div>

      {/* Drop zone────────────────────────────────────────────────── */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn("flex min-h-50 flex-1 flex-col gap-3 rounded-2xl p-2 transition-colors duration-150")}
          style={{
            background: isOver
              ? `color-mix(in srgb, ${column.color} 8%, var(--color-card-bg))`
              : "color-mix(in srgb, var(--color-desc) 6%, transparent)",
          }}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              users={users}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}

          {tasks.length === 0 && (
            <div
              className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed py-10 text-center transition-colors duration-150"
              style={{ borderColor: isOver ? column.color : "var(--color-date-border)" }}
            >
              <span className="text-[11px]" style={{ color: "var(--color-desc)" }}>
                {isOver ? "Drop here" : "No tasks"}
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
