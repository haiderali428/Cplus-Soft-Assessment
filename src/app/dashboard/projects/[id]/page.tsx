"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  ExternalLink,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchProjectById, selectProject } from "@/store/projectsSlice";
import { fetchTasks } from "@/store/tasksSlice";
import { useUsers } from "@/hooks/useUsers";
import { Task, ProjectStatus } from "@/types";

import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { SubHeading } from "@/components/typography/SubHeading";
import { Paragraph } from "@/components/typography/Paragraph";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

// Config────

const STATUS_META: Record<ProjectStatus, { label: string; variant: "success" | "warning" | "info" }> = {
  active:    { label: "Active",    variant: "success" },
  onhold:    { label: "On Hold",   variant: "warning" },
  completed: { label: "Completed", variant: "info"    },
};

const TASK_STATUS_META: Record<string, { label: string; color: string }> = {
  backlog:    { label: "Backlog",      color: "#768396" },
  todo:       { label: "Todo",         color: "#1EA7FF" },
  inprogress: { label: "In Progress",  color: "#F59E0B" },
  review_qa:  { label: "Review & QA",  color: "#5051F9" },
  rejection:  { label: "Rejection",    color: "#EF4444" },
  completed:  { label: "Completed",    color: "#10B981" },
};

const PRIORITY_VARIANT = {
  low:    "success",
  medium: "warning",
  high:   "danger",
} as const;

// Helpers───

function fmt(iso: string | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// Loading skeleton────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-9 w-2/3 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-5 w-24 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-32 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Task row──

function TaskRow({ task, users }: { task: Task; users: ReturnType<typeof useUsers>["users"] }) {
  const assignedUser = users.find((u) => u.id === task.assignedUser);
  const statusMeta   = TASK_STATUS_META[task.status];

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-3 rounded-xl border p-3 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tag-design"
      style={{
        background:   "var(--color-card-bg)",
        borderColor:  "var(--color-date-border)",
      }}
    >
      {/* Status dot */}
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: statusMeta?.color ?? "#768396" }}
        aria-hidden
      />

      {/* Title + badges */}
      <div className="min-w-0 flex-1">
        <CardHeading className="truncate text-[13px]!">{task.title}</CardHeading>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {statusMeta && (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
              style={{ background: statusMeta.color }}
            >
              {statusMeta.label}
            </span>
          )}
          <Badge
            variant={PRIORITY_VARIANT[task.priority] ?? "default"}
            className="capitalize text-[10px]!"
          >
            {task.priority}
          </Badge>
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--color-desc)" }}>
              <CalendarDays size={9} aria-hidden />
              {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      {/* Assignee avatar */}
      {assignedUser && (
        <div
          title={assignedUser.name}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: "var(--tag-design)" }}
        >
          {assignedUser.name[0].toUpperCase()}
        </div>
      )}

      <ExternalLink size={13} style={{ color: "var(--color-desc)" }} aria-hidden />
    </Link>
  );
}

// Page─────

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const dispatch = useAppDispatch();
  const project  = useAppSelector((s) => s.projects.selected);
  const tasks    = useAppSelector((s) => s.tasks.items);
  const { users } = useUsers();

  const [isLoading, setIsLoading]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);

    dispatch(fetchProjectById(id))
      .then((action) => {
        if (fetchProjectById.rejected.match(action)) {
          setFetchError((action.payload as string) ?? "Project not found.");
        }
      })
      .finally(() => setIsLoading(false));

    if (tasks.length === 0) dispatch(fetchTasks());

    return () => { dispatch(selectProject(null)); };
  }, [id, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const projectTasks = tasks.filter((t) => t.projectId === id);

  // Accent colour from category─────────────────────────────────────

  const CATEGORY_COLOR: Record<string, string> = {
    design:      "var(--tag-design)",
    planning:    "var(--tag-planning)",
    research:    "var(--tag-research)",
    development: "var(--tag-development)",
  };
  const accentColor = project
    ? (CATEGORY_COLOR[project.category] ?? "var(--tag-design)")
    : "var(--tag-design)";

  // Loading ─

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 p-6 sm:p-8">
        <Skeleton className="h-5 w-32 rounded" />
        <DetailSkeleton />
      </div>
    );
  }

  // Error / not found───────────────────────────────────────────────

  if (fetchError || !project) {
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-8">
        <Link
          href="/dashboard/projects"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--color-desc)" }}
        >
          <ArrowLeft size={14} aria-hidden /> Back to Projects
        </Link>
        <Alert
          type="error"
          message={
            fetchError ??
            "This project could not be found. It may have been deleted or the mock server is not running (npm run mock)."
          }
        />
      </div>
    );
  }

  const statusMeta = STATUS_META[project.status];
  const owner      = users.find((u) => u.id === project.ownerId);

  // Detail view─────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 sm:p-8">

      {/* Back */}
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--color-desc)" }}
      >
        <ArrowLeft size={14} aria-hidden /> Back to Projects
      </Link>

      {/* Header─────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--color-date-border)" }}
      >
        {/* Category accent strip */}
        <div className="h-1.5 w-full" style={{ background: accentColor }} />

        <div className="p-6">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <SubHeading as="h1" className="text-2xl lg:text-3xl">
              {project.name}
            </SubHeading>
            <div className="flex flex-wrap items-center gap-2">
              <Tag category={project.category} />
              {statusMeta && (
                <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
              )}
            </div>
          </div>

          {project.description && (
            <Paragraph className="mb-5 leading-7">{project.description}</Paragraph>
          )}

          {/* Progress bar */}
          <div className="mb-5">
            <div className="mb-1.5 flex items-center justify-between">
              <CardDesc className="text-[11px]!">Progress</CardDesc>
              <CardDesc className="text-[11px]! font-semibold">{project.progress}%</CardDesc>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ background: "color-mix(in srgb, var(--color-desc) 15%, transparent)" }}
              role="progressbar"
              aria-valuenow={project.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${project.progress}% complete`}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%`, background: accentColor }}
              />
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <CardDesc className="mb-1 flex items-center gap-1 text-[10px]! uppercase tracking-widest">
                <Layers size={10} aria-hidden /> Category
              </CardDesc>
              <Tag category={project.category} />
            </div>

            <div>
              <CardDesc className="mb-1 flex items-center gap-1 text-[10px]! uppercase tracking-widest">
                <Users size={10} aria-hidden /> Members
              </CardDesc>
              <CardHeading className="text-[14px]!">{project.memberIds.length}</CardHeading>
            </div>

            <div>
              <CardDesc className="mb-1 flex items-center gap-1 text-[10px]! uppercase tracking-widest">
                <CheckCircle2 size={10} aria-hidden /> Tasks
              </CardDesc>
              <CardHeading className="text-[14px]!">{projectTasks.length}</CardHeading>
            </div>

            <div>
              <CardDesc className="mb-1 flex items-center gap-1 text-[10px]! uppercase tracking-widest">
                <CalendarDays size={10} aria-hidden /> Created
              </CardDesc>
              <CardDesc className="text-[12px]! font-medium">{fmt(project.createdAt)}</CardDesc>
            </div>
          </div>

          {owner && (
            <div className="mt-5 flex items-center gap-2 border-t pt-4" style={{ borderColor: "var(--color-date-border)" }}>
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: accentColor }}
                aria-hidden
              >
                {owner.name[0].toUpperCase()}
              </div>
              <div>
                <CardDesc className="text-[10px]! uppercase tracking-wider">Owner</CardDesc>
                <CardHeading className="text-[13px]!">{owner.name}</CardHeading>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks──────────────────────────────────────────────────── */}
      <section aria-label="Project tasks">
        <div className="mb-4 flex items-center justify-between">
          <SubHeading as="h2" className="text-xl lg:text-2xl">
            Tasks
          </SubHeading>
          <span
            className="flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] font-semibold tabular-nums"
            style={{
              background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
              color:       accentColor,
            }}
          >
            {projectTasks.length}
          </span>
        </div>

        {projectTasks.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-14 text-center"
            style={{ borderColor: "var(--color-date-border)" }}
          >
            <Clock size={26} style={{ color: "var(--color-desc)" }} aria-hidden />
            <CardDesc className="text-sm!">No tasks linked to this project yet.</CardDesc>
            <Paragraph className="max-w-xs text-xs! leading-5">
              Add tasks from the Board and assign them to this project.
            </Paragraph>
          </div>
        ) : (
          <div className="space-y-2.5">
            {projectTasks.map((task) => (
              <TaskRow key={task.id} task={task} users={users} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
