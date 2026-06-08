"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, Layers, AlertCircle } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchProjects, clearError } from "@/store/projectsSlice";
import { Project, ProjectStatus } from "@/types";

import { ProjectCard, ProjectCardSkeleton } from "@/components/projects/ProjectCard";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import { DeleteProjectModal } from "@/components/projects/DeleteProjectModal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SubHeading } from "@/components/typography/SubHeading";
import { Paragraph } from "@/components/typography/Paragraph";
import { CardDesc } from "@/components/typography/CardDesc";

// Filter tabs ─

type FilterValue = "all" | ProjectStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "active",    label: "Active"    },
  { value: "onhold",    label: "On Hold"   },
  { value: "completed", label: "Completed" },
];

// Modal state ─

interface FormModalState {
  open:     boolean;
  project?: Project;
}

interface DeleteModalState {
  open:     boolean;
  project?: Project;
}

// Page─────

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { items: projects, loading, error } = useAppSelector((s) => s.projects);
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const isAdmin       = useAppSelector((s) => s.auth.user?.role === "admin");

  const [filter,      setFilter]      = useState<FilterValue>("all");
  const [formModal,   setFormModal]   = useState<FormModalState>({ open: false });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ open: false });

  // Ref array for tab buttons — used for arrow-key navigation
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const retry = () => {
    dispatch(clearError());
    dispatch(fetchProjects());
  };

  // Derived 

  const filtered = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((p) => p.status === filter),
    [projects, filter]
  );

  const countFor = useMemo(
    () =>
      (value: FilterValue) =>
        value === "all"
          ? projects.length
          : projects.filter((p) => p.status === value).length,
    [projects]
  );

  // Handlers

  const openCreate = () => setFormModal({ open: true, project: undefined });
  const openEdit   = (project: Project) => setFormModal({ open: true, project });
  const openDelete = (project: Project) => setDeleteModal({ open: true, project });
  const closeForm   = () => setFormModal({ open: false });
  const closeDelete = () => setDeleteModal({ open: false });

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % FILTERS.length;
    if (e.key === "ArrowLeft")  next = (idx - 1 + FILTERS.length) % FILTERS.length;
    if (next !== -1) {
      e.preventDefault();
      tabRefs.current[next]?.focus();
      setFilter(FILTERS[next].value);
    }
  };

  // Render

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">

        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SubHeading as="h1" className="text-2xl lg:text-3xl">
              Projects
            </SubHeading>
            <Paragraph className="mt-1 text-sm leading-6 lg:text-sm">
              Manage all your projects — create, update, or remove them here.
            </Paragraph>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={openCreate}
            className="shrink-0 gap-2"
          >
            <Plus size={16} aria-hidden />
            New Project
          </Button>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-wrap items-center gap-3">
            <Alert
              type="error"
              message={`Failed to load projects: ${error}. Make sure the mock server is running (npm run mock).`}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={retry} className="shrink-0 gap-1.5">
              <RefreshCw size={13} aria-hidden />
              Retry
            </Button>
          </div>
        )}

        {/* Filter tabs */}
        <div
          role="tablist"
          aria-label="Filter projects by status"
          className="flex flex-wrap gap-1.5"
        >
          {FILTERS.map(({ value, label }, idx) => {
            const active = filter === value;
            const count  = countFor(value);
            return (
              <button
                key={value}
                ref={(el) => { tabRefs.current[idx] = el; }}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(value)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tag-design cursor-pointer"
                style={
                  active
                    ? { background: "var(--tag-design)", color: "#fff" }
                    : {
                        background: "color-mix(in srgb, var(--color-desc) 10%, transparent)",
                        color:      "var(--color-desc)",
                      }
                }
              >
                {label}
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums"
                  style={
                    active
                      ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                      : {
                          background: "color-mix(in srgb, var(--color-desc) 18%, transparent)",
                          color:      "var(--color-desc)",
                        }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}

        {/* Loading skeleton */}
        {loading && projects.length === 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Loaded — project grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={openEdit}
                onDelete={openDelete}
                canDelete={project.createdBy === currentUserId || isAdmin}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Empty state — no projects at all */}
        {!loading && projects.length === 0 && !error && (
          <div
            className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed py-20 text-center"
            style={{ borderColor: "var(--color-date-border)" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "color-mix(in srgb, var(--tag-design) 12%, transparent)" }}
            >
              <Layers size={26} style={{ color: "var(--tag-design)" }} aria-hidden />
            </div>
            <div>
              <CardDesc className="text-sm! font-semibold" style={{ color: "var(--color-heading)" }}>
                No projects yet
              </CardDesc>
              <CardDesc className="mt-1 text-[12px]!">
                Click <strong>New Project</strong> to get started.
              </CardDesc>
            </div>
            <Button variant="primary" size="sm" onClick={openCreate} className="gap-1.5">
              <Plus size={14} aria-hidden />
              New Project
            </Button>
          </div>
        )}

        {/* Empty state — filter has no matches */}
        {!loading && projects.length > 0 && filtered.length === 0 && (
          <div
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-16 text-center"
            style={{ borderColor: "var(--color-date-border)" }}
          >
            <AlertCircle size={28} style={{ color: "var(--color-desc)" }} aria-hidden />
            <CardDesc className="text-sm!">
              No <strong>{FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}</strong> projects found.
            </CardDesc>
            <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
              Show all projects
            </Button>
          </div>
        )}
      </div>

      {/* Modals (rendered outside the scroll container)*/}

      {formModal.open && (
        <ProjectFormModal
          project={formModal.project}
          onClose={closeForm}
        />
      )}

      {deleteModal.open && deleteModal.project && (
        <DeleteProjectModal
          project={deleteModal.project}
          onClose={closeDelete}
        />
      )}
    </>
  );
}
