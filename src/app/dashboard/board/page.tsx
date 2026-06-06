"use client";

import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setTaskFilter, type TaskFilterValue } from "@/store/uiSlice";
import { Spinner } from "@/components/ui/Spinner";
import { SubHeading } from "@/components/typography/SubHeading";
import { CardDesc } from "@/components/typography/CardDesc";

const KanbanBoard = dynamic(
  () => import("@/components/tasks/KanbanBoard").then((m) => ({ default: m.KanbanBoard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    ),
  }
);

const FILTER_OPTIONS: { value: TaskFilterValue; label: string }[] = [
  { value: "all",  label: "All Tasks" },
  { value: "mine", label: "My Tasks"  },
];

export default function BoardPage() {
  const dispatch    = useAppDispatch();
  const taskFilter  = useAppSelector((s) => s.ui.taskFilter);
  const searchQuery = useAppSelector((s) => s.ui.searchQuery);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header───────────────────────────────────────────────── */}
      <div
        className="shrink-0 border-b px-6 py-4"
        style={{ borderColor: "var(--color-date-border)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <SubHeading as="h1" className="text-2xl lg:text-3xl">
              Board
            </SubHeading>
            <CardDesc className="mt-0.5">
              Drag tasks between columns to update status. Click a card to view details.
            </CardDesc>
          </div>

          {/* All / My Tasks toggle */}
          <div
            role="group"
            aria-label="Task visibility filter"
            className="flex gap-1 rounded-lg p-1"
            style={{ background: "color-mix(in srgb, var(--color-desc) 10%, transparent)" }}
          >
            {FILTER_OPTIONS.map(({ value, label }) => {
              const active = taskFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => dispatch(setTaskFilter(value))}
                  aria-pressed={active}
                  className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tag-design"
                  style={
                    active
                      ? { background: "var(--color-card-bg)", color: "var(--color-heading)", boxShadow: "0 1px 3px rgba(0,0,0,.12)" }
                      : { color: "var(--color-desc)" }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active filter summary */}
        {(searchQuery.trim() || taskFilter === "mine") && (
          <p className="mt-2 text-[11px]" style={{ color: "var(--color-desc)" }}>
            {[
              taskFilter === "mine" && "My Tasks",
              searchQuery.trim() && `"${searchQuery.trim()}"`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      {/* Kanban board───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}
