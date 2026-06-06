"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FolderKanban,
  Tag as TagIcon,
  User as UserIcon,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchTaskById, selectTask } from "@/store/tasksSlice";
import { useUsers } from "@/hooks/useUsers";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MainHeading } from "@/components/typography/MainHeading";
import { SubHeading } from "@/components/typography/SubHeading";
import { Paragraph } from "@/components/typography/Paragraph";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

// Status config───────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string }> = {
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
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });
}

// Field cell

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={12} style={{ color: "var(--color-desc)" }} aria-hidden />}
        <CardHeading as="p" className="uppercase tracking-widest text-[10px]! text-desc">
          {label}
        </CardHeading>
      </div>
      <div>{children}</div>
    </div>
  );
}

// Loading skeleton────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Banner */}
      <Skeleton className="mb-8 h-70 w-full rounded-2xl" />
      {/* Tag + heading */}
      <Skeleton className="mb-4 h-6 w-20 rounded" />
      <Skeleton className="mb-2 h-10 w-3/4 rounded" />
      <Skeleton className="mb-10 h-10 w-1/2 rounded" />
      {/* Divider */}
      <Skeleton className="mb-6 h-px w-full" />
      {/* Details grid */}
      <Skeleton className="mb-5 h-7 w-24 rounded" />
      <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
        ))}
      </div>
      {/* Description */}
      <Skeleton className="mb-5 h-7 w-32 rounded" />
      <Skeleton className="mb-2 h-5 w-full rounded" />
      <Skeleton className="mb-2 h-5 w-5/6 rounded" />
      <Skeleton className="mb-10 h-5 w-4/6 rounded" />
      {/* Assigned to */}
      <Skeleton className="mb-5 h-7 w-28 rounded" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

// Page─────

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16: params is a Promise — unwrap with React.use()
  const { id } = use(params);

  const dispatch = useAppDispatch();
  const task = useAppSelector((s) => s.tasks.selected);
  const { users } = useUsers();

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);

    dispatch(fetchTaskById(id))
      .then((action) => {
        if (fetchTaskById.rejected.match(action)) {
          setFetchError(
            (action.payload as string) ?? "Task not found or server unavailable."
          );
        }
      })
      .finally(() => setIsLoading(false));

    return () => {
      dispatch(selectTask(null));
    };
  }, [id, dispatch]);

  const assignedUser = task?.assignedUser
    ? users.find((u) => u.id === task.assignedUser)
    : undefined;

  const statusMeta = task ? STATUS_META[task.status] : undefined;

  // Shared top bar───────────────────────────────────────────────── //

  const topBar = (
    <header
      className="sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 sm:px-6"
      style={{
        background:   "var(--color-card-bg)",
        borderColor:  "var(--color-date-border)",
      }}
    >
      <Link
        href="/dashboard/board"
        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-board-bg"
        style={{ color: "var(--color-desc)" }}
      >
        <ArrowLeft size={15} aria-hidden />
        Back to Board
      </Link>
      <ThemeToggle />
    </header>
  );

  // Loading  //

  if (isLoading) {
    return (
      <div style={{ minHeight: "100dvh" }}>
        {topBar}
        <DetailSkeleton />
      </div>
    );
  }

  // Error //

  if (fetchError || !task) {
    return (
      <div style={{ minHeight: "100dvh" }}>
        {topBar}
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <Alert
            type="error"
            message={
              fetchError ??
              "This task could not be found. It may have been deleted or the mock server is not running (npm run mock)."
            }
          />
          <Link
            href="/dashboard/board"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--tag-design)" }}
          >
            <ArrowLeft size={14} aria-hidden />
            Back to Board
          </Link>
        </div>
      </div>
    );
  }

  // Detail view──────────────────────────────────────────────────── //

  return (
    <div style={{ minHeight: "100dvh" }}>
      {topBar}

      <article className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">

        {/* Banner image───────────────────────────────────────────── */}
        {task.bannerImage && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            <img
              src={task.bannerImage}
              alt=""
              aria-hidden
              className="h-70 w-full object-cover sm:h-80"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display =
                  "none";
              }}
            />
          </div>
        )}

        {/* Category + status chips─────────────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Tag category={task.category} />
          {statusMeta && (
            <span
              className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold text-white"
              style={{ background: statusMeta.color }}
            >
              {statusMeta.label}
            </span>
          )}
          <Badge
            variant={PRIORITY_VARIANT[task.priority] ?? "default"}
            className="capitalize"
          >
            {task.priority} priority
          </Badge>
        </div>

        {/* Title──────────────────────────────────────────────────── */}
        <MainHeading as="h1" className="mb-10 lg:text-[48px]">
          {task.title}
        </MainHeading>

        {/*─── */}
        <hr style={{ borderColor: "var(--color-date-border)" }} className="mb-8" />

        {/* Details grid───────────────────────────────────────────── */}
        <section aria-label="Task details" className="mb-10">
          <SubHeading as="h2" className="mb-6 text-xl lg:text-2xl">
            Details
          </SubHeading>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">

            <Field icon={TagIcon} label="Status">
              {statusMeta ? (
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white"
                  style={{ background: statusMeta.color }}
                >
                  {statusMeta.label}
                </span>
              ) : (
                <CardDesc>—</CardDesc>
              )}
            </Field>

            <Field icon={TagIcon} label="Priority">
              <Badge
                variant={PRIORITY_VARIANT[task.priority] ?? "default"}
                className="capitalize text-sm"
              >
                {task.priority}
              </Badge>
            </Field>

            <Field icon={CalendarDays} label="Due Date">
              <CardDesc className="text-sm! font-medium">
                {fmt(task.dueDate)}
              </CardDesc>
            </Field>

            <Field icon={FolderKanban} label="Category">
              <Tag category={task.category} />
            </Field>

            {task.projectId && (
              <Field icon={FolderKanban} label="Project">
                <CardDesc className="text-sm! font-mono">{task.projectId}</CardDesc>
              </Field>
            )}

            <Field icon={Clock} label="Created">
              <CardDesc className="text-sm! font-medium">{fmt(task.createdAt)}</CardDesc>
            </Field>

          </div>
        </section>

        {/*─── */}
        <hr style={{ borderColor: "var(--color-date-border)" }} className="mb-8" />

        {/* Description────────────────────────────────────────────── */}
        <section aria-label="Task description" className="mb-10">
          <SubHeading as="h2" className="mb-4 text-xl lg:text-2xl">
            Description
          </SubHeading>

          {task.description ? (
            <Paragraph className="text-base leading-8 lg:text-lg">
              {task.description}
            </Paragraph>
          ) : (
            <Paragraph className="text-base italic opacity-50 lg:text-base">
              No description provided.
            </Paragraph>
          )}
        </section>

        {/*─── */}
        <hr style={{ borderColor: "var(--color-date-border)" }} className="mb-8" />

        {/* Assigned to────────────────────────────────────────────── */}
        <section aria-label="Assigned user" className="mb-10">
          <SubHeading as="h2" className="mb-4 text-xl lg:text-2xl">
            Assigned To
          </SubHeading>

          {assignedUser ? (
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: "var(--tag-design)" }}
                aria-hidden
              >
                {assignedUser.name[0].toUpperCase()}
              </div>
              <div>
                <CardHeading className="text-base!">{assignedUser.name}</CardHeading>
                <CardDesc className="mt-0.5">{assignedUser.email}</CardDesc>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--color-desc) 15%, transparent)" }}
                aria-hidden
              >
                <UserIcon size={18} style={{ color: "var(--color-desc)" }} />
              </div>
              <Paragraph className="text-base lg:text-base">Unassigned</Paragraph>
            </div>
          )}
        </section>

        {/*─── */}
        <hr style={{ borderColor: "var(--color-date-border)" }} className="mb-8" />

        {/* Metadata───────────────────────────────────────────────── */}
        <section aria-label="Task metadata">
          <SubHeading as="h2" className="mb-4 text-xl lg:text-2xl">
            Activity
          </SubHeading>

          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <CardHeading
                as="span"
                className="w-20 shrink-0 uppercase tracking-widest text-[10px]! text-desc"
              >
                Created
              </CardHeading>
              <Paragraph className="text-sm leading-6 lg:text-sm">
                {fmt(task.createdAt)}
              </Paragraph>
            </div>

            <div className="flex items-baseline gap-3">
              <CardHeading
                as="span"
                className="w-20 shrink-0 uppercase tracking-widest text-[10px]! text-desc"
              >
                Updated
              </CardHeading>
              <Paragraph className="text-sm leading-6 lg:text-sm">
                {fmt(task.updatedAt)}
              </Paragraph>
            </div>
          </div>
        </section>

      </article>
    </div>
  );
}
