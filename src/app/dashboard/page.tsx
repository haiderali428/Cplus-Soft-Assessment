"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  FolderOpen,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchTasks } from "@/store/tasksSlice";
import { computeDashboardStats } from "@/lib/stats";
import { fetchProjects } from "@/store/projectsSlice";

import { StatCard } from "@/components/dashboard/StatCard";
import { StatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SubHeading } from "@/components/typography/SubHeading";
import { Paragraph } from "@/components/typography/Paragraph";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

// Recharts uses browser APIs — load only on client
const TaskStatusChart = dynamic(
  () =>
    import("@/components/dashboard/TaskStatusChart").then((m) => ({
      default: m.TaskStatusChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton height={260} /> }
);

const TaskCategoryChart = dynamic(
  () =>
    import("@/components/dashboard/TaskCategoryChart").then((m) => ({
      default: m.TaskCategoryChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton height={260} /> }
);

// Helpers───

function sectionLabel(text: string) {
  return (
    <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-desc">
      {text}
    </p>
  );
}

// Page─────

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const { items: tasks,    loading: tasksLoading,    error: tasksError    } =
    useAppSelector((s) => s.tasks);
  const { items: projects, loading: projectsLoading, error: projectsError } =
    useAppSelector((s) => s.projects);
  const user = useAppSelector((s) => s.auth.user);

  const loading = tasksLoading || projectsLoading;
  const error   = tasksError ?? projectsError;

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
  }, [dispatch]);

  // Derived stats────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => computeDashboardStats(tasks, projects), [tasks, projects]);

  const retry = () => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 sm:p-8">

      {/* Page heading───────────────────────────────────────────── */}
      <div>
        <SubHeading as="h1" className="lg:text-[32px]">
          {user ? `Welcome, ${user.name.split(" ")[0]}` : "Dashboard"}
        </SubHeading>
        <Paragraph className="mt-1 text-base leading-6">
          Here&apos;s a real-time overview of your projects and tasks.
        </Paragraph>
      </div>

      {/* Error state────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="flex flex-wrap items-center gap-3">
          <Alert
            type="error"
            message={`Failed to load data: ${error}. Make sure the mock server is running (npm run mock).`}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={retry} className="shrink-0">
            <RefreshCw size={13} />
            Retry
          </Button>
        </div>
      )}

      {/* Stat cards─────────────────────────────────────────────── */}
      <section aria-label="Summary statistics">
        {sectionLabel("Overview")}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                icon={FolderOpen}
                label="Total Projects"
                value={stats.totalProjects}
                accentColor="var(--tag-design)"
              />
              <StatCard
                icon={ListTodo}
                label="Total Tasks"
                value={stats.totalTasks}
                accentColor="var(--tag-research)"
              />
              <StatCard
                icon={CheckCircle2}
                label="Completed Tasks"
                value={stats.completedTasks}
                accentColor="var(--tag-planning)"
                description="Status: review / QA"
              />
              <StatCard
                icon={Clock}
                label="Pending Tasks"
                value={stats.pendingTasks}
                accentColor="var(--tag-development)"
                description="Status: backlog or to do"
              />
            </>
          )}
        </div>
      </section>

      {/* Charts─────────────────────────────────────────────────── */}
      <section aria-label="Task analytics">
        {sectionLabel("Analytics")}

        {loading ? (
          /* Skeleton layout matches real chart layout */
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ChartSkeleton height={260} />
            </div>
            <div className="lg:col-span-2">
              <ChartSkeleton height={260} />
            </div>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty state */
          <div
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-16 text-center"
            style={{ borderColor: "var(--color-date-border)" }}
          >
            <AlertCircle size={32} style={{ color: "var(--color-desc)" }} />
            <CardHeading>No tasks yet</CardHeading>
            <CardDesc className="max-w-xs">
              Add your first task using the <strong>Add Task</strong> button above.
            </CardDesc>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Bar chart — 3/5 columns */}
            <div className="lg:col-span-3">
              <TaskStatusChart tasks={tasks} />
            </div>
            {/* Donut chart — 2/5 columns */}
            <div className="lg:col-span-2">
              <TaskCategoryChart tasks={tasks} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
