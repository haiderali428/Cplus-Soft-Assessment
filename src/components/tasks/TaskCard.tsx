"use client";

import { memo } from "react";
import Link from "next/link";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, User } from "@/types";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

const PRIORITY_VARIANT = {
  low:    "success",
  medium: "warning",
  high:   "danger",
} as const;

interface TaskCardInnerProps {
  task:        Task;
  users:       User[];
  isDragging?: boolean;
  isOverlay?:  boolean;
}

/** Pure visual card — used by both TaskCard and DragOverlay. */
export const TaskCardInner = memo(function TaskCardInner({
  task,
  users,
  isDragging,
  isOverlay,
}: TaskCardInnerProps) {
  const user = users.find((u) => u.id === task.assignedUser);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card-bg transition-shadow",
        "border-date-border",
        isDragging
          ? "opacity-30 shadow-none ring-2 ring-tag-design ring-dashed"
          : "shadow-sm hover:shadow-md",
        isOverlay && "cursor-grabbing shadow-2xl ring-0"
      )}
    >
      {task.bannerImage && (
        <img
          src={task.bannerImage}
          alt=""
          aria-hidden
          className="h-28 w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}

      <div className="space-y-2.5 p-3">
        <Tag category={task.category} />

        <CardHeading className="line-clamp-2 text-[13px]!">{task.title}</CardHeading>

        {task.description && (
          <CardDesc className="line-clamp-2 text-[11px]!">{task.description}</CardDesc>
        )}

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant={PRIORITY_VARIANT[task.priority] ?? "default"}
              className="capitalize text-[10px]!"
            >
              {task.priority}
            </Badge>

            {task.dueDate && (
              <span
                className="flex items-center gap-1 text-[10px]"
                style={{ color: "var(--color-desc)" }}
              >
                <CalendarDays size={10} aria-hidden />
                {new Date(task.dueDate).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short",
                })}
              </span>
            )}
          </div>

          {user && (
            <div
              title={user.name}
              aria-label={`Assigned to ${user.name}`}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: "var(--tag-design)" }}
            >
              {user.name[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

interface TaskCardProps {
  task:            Task;
  users:           User[];
  onEdit?:         (task: Task) => void;
  onDelete?:       (task: Task) => void;
  currentUserId?:  string;
  isAdmin?:        boolean;
}

export const TaskCard = memo(function TaskCard({
  task,
  users,
  onEdit,
  onDelete,
  currentUserId,
  isAdmin,
}: TaskCardProps) {
  const isCreator  = Boolean(currentUserId && task.createdBy === currentUserId);
  const canEdit    = Boolean(currentUserId);
  const canDelete  = isCreator || Boolean(isAdmin);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id:   task.id,
    data: { type: "task", task },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:  CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
      }}
      className="group relative rounded-xl"
    >
      {/* Floating action cluster (top-right)─────────────────────── */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5">
        {/* Edit — creator only; Delete — creator or admin */}
        {canEdit && onEdit && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(task); }}
            className="flex h-6 w-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tag-design cursor-pointer"
            style={{ background: "color-mix(in srgb, var(--color-desc) 14%, var(--color-card-bg))" }}
            aria-label={`Edit ${task.title}`}
            title="Edit task"
          >
            <Pencil size={10} style={{ color: "var(--color-desc)" }} />
          </button>
        )}
        {canDelete && onDelete && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(task); }}
            className="flex h-6 w-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 cursor-pointer"
            style={{ background: "color-mix(in srgb, var(--color-desc) 14%, var(--color-card-bg))" }}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            <Trash2 size={10} style={{ color: "#ef4444" }} />
          </button>
        )}

        {/* Drag handle — always reachable, visually subtle */}
        <div
          {...attributes}
          {...listeners}
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded opacity-40 transition-opacity group-hover:opacity-90 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-tag-design"
          style={{ background: "color-mix(in srgb, var(--color-desc) 14%, var(--color-card-bg))" }}
          aria-label="Drag to reorder task"
          title="Drag to reorder"
          role="button"
          tabIndex={0}
        >
          <GripVertical size={11} style={{ color: "var(--color-desc)" }} />
        </div>
      </div>

      {/* Card body → task detail page────────────────────────────── */}
      <Link
        href={`/tasks/${task.id}`}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tag-design"
        tabIndex={isDragging ? -1 : 0}
        aria-label={`View task: ${task.title}`}
      >
        <TaskCardInner task={task} users={users} isDragging={isDragging} />
      </Link>
    </div>
  );
});
