"use client";

import { memo } from "react";
import Link from "next/link";
import { Pencil, Trash2, Users, CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project, ProjectStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

// Status config───────────────────────────────────────────────────────

const STATUS_META: Record<
  ProjectStatus,
  { label: string; variant: "success" | "warning" | "info" }
> = {
  active:    { label: "Active",    variant: "success" },
  onhold:    { label: "On Hold",   variant: "warning" },
  completed: { label: "Completed", variant: "info"    },
};

const CATEGORY_COLOR: Record<string, string> = {
  design:      "var(--tag-design)",
  planning:    "var(--tag-planning)",
  research:    "var(--tag-research)",
  development: "var(--tag-development)",
};

// Skeleton──

export function ProjectCardSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-xl"
      style={{ background: "var(--color-card-bg)" }}
    >
      <div
        className="h-1.5 w-full"
        style={{ background: "color-mix(in srgb, var(--color-desc) 20%, transparent)" }}
      />
      <div className="space-y-3 p-5">
        {[["3/4", "5/6"], ["1/4", "full"], ["full", "5/6"], ["full"], ["1/2", "1/3"]].map(
          (widths, i) => (
            <div key={i} className={cn("space-y-1.5", i === 3 && "pt-1")}>
              {widths.map((w, j) => (
                <div
                  key={j}
                  className={cn("rounded", i === 3 ? "h-1.5" : i === 0 ? "h-5" : "h-3")}
                  style={{
                    width: `${w.replace("/", " / ")}`,
                    background: "color-mix(in srgb, var(--color-desc) 12%, transparent)",
                  }}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Card──────

interface ProjectCardProps {
  project:   Project;
  onEdit:    (project: Project) => void;
  onDelete:  (project: Project) => void;
  canDelete?: boolean;
  /** Used for staggered entrance animation delay */
  index?:    number;
}

export const ProjectCard = memo(function ProjectCard({
  project,
  onEdit,
  onDelete,
  canDelete = false,
  index = 0,
}: ProjectCardProps) {
  const accentColor = CATEGORY_COLOR[project.category] ?? "var(--tag-design)";
  const statusMeta  = STATUS_META[project.status];

  return (
    <article
      className="animate-card-in flex flex-col overflow-hidden rounded-xl border border-date-border bg-card-bg shadow-sm transition-shadow hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={`Project: ${project.name}`}
    >
      {/* Category accent strip */}
      <div className="h-1.5 w-full" style={{ background: accentColor }} />

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">

        {/* Title + status */}
        <div className="flex items-start justify-between gap-2">
          <CardHeading className="line-clamp-1 flex-1 text-[15px]! font-semibold">
            {project.name}
          </CardHeading>
          {statusMeta && (
            <Badge variant={statusMeta.variant} className="shrink-0 text-[10px]!">
              {statusMeta.label}
            </Badge>
          )}
        </div>

        {/* Description */}
        <CardDesc className="line-clamp-2 min-h-10 text-[12px]! leading-5">
          {project.description ?? "No description provided."}
        </CardDesc>

        {/* Progress bar */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <CardDesc className="text-[11px]!">Progress</CardDesc>
            <CardDesc className="text-[11px]! font-semibold">{project.progress}%</CardDesc>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
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

        {/* Footer meta */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <Tag category={project.category} className="py-0.5! px-1.5! text-[10px]!" />
            <span
              className="flex items-center gap-1 text-[11px]"
              style={{ color: "var(--color-desc)" }}
            >
              <Users size={11} aria-hidden />
              {project.memberIds.length}
            </span>
          </div>
          <span
            className="flex items-center gap-1 text-[11px]"
            style={{ color: "var(--color-desc)" }}
          >
            <CalendarDays size={11} aria-hidden />
            {new Date(project.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-end gap-2 border-t px-5 py-3"
        style={{ borderColor: "var(--color-date-border)" }}
      >
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tag-design"
          style={{
            background:  "color-mix(in srgb, var(--color-desc) 10%, transparent)",
            color:       "var(--color-desc)",
          }}
          aria-label={`View details for ${project.name}`}
        >
          <ArrowRight size={12} aria-hidden />
          Details
        </Link>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(project)}
          aria-label={`Edit ${project.name}`}
          className="gap-1.5"
        >
          <Pencil size={13} aria-hidden />
          Edit
        </Button>

        {/* Delete is only rendered for admin users */}
        {canDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.name}`}
            className="gap-1.5"
          >
            <Trash2 size={13} aria-hidden />
            Delete
          </Button>
        )}
      </div>
    </article>
  );
});
