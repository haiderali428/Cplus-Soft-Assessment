"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { createProject, updateProject } from "@/store/projectsSlice";
import { Project } from "@/types";
import { projectSchema, ProjectFormValues } from "@/lib/schemas/project";
import { Modal } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// Option lists───────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "active",    label: "Active"    },
  { value: "onhold",   label: "On Hold"   },
  { value: "completed", label: "Completed" },
];

const CATEGORY_OPTIONS = [
  { value: "design",      label: "Design"      },
  { value: "planning",    label: "Planning"    },
  { value: "research",    label: "Research"    },
  { value: "development", label: "Development" },
];

// Component─

interface ProjectFormModalProps {
  /** undefined = create mode; Project = edit mode */
  project?: Project;
  onClose: () => void;
}

export function ProjectFormModal({ project, onClose }: ProjectFormModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.projects);
  const currentUser = useAppSelector((s) => s.auth.user);

  const isEdit = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: isEdit
      ? {
          name:        project.name,
          description: project.description ?? "",
          status:      project.status,
          category:    project.category,
        }
      : {
          name:        "",
          description: "",
          status:      "active",
          category:    "planning",
        },
  });

  // Re-seed defaults if the project prop changes (e.g. user opens edit modal for a different project)
  useEffect(() => {
    reset(
      isEdit
        ? {
            name:        project.name,
            description: project.description ?? "",
            status:      project.status,
            category:    project.category,
          }
        : { name: "", description: "", status: "active", category: "planning" }
    );
  }, [project?.id, isEdit, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: ProjectFormValues) => {
    if (isEdit) {
      const result = await dispatch(
        updateProject({
          id:   project.id,
          data: {
            name:        data.name,
            description: data.description || undefined,
            status:      data.status,
            category:    data.category,
          },
        })
      );
      if (updateProject.fulfilled.match(result)) {
        toast.success("Project updated");
        onClose();
      }
    } else {
      const ownerId   = currentUser?.id ?? "u1";
      const result    = await dispatch(
        createProject({
          name:        data.name,
          description: data.description || undefined,
          status:      data.status,
          category:    data.category,
          progress:    0,
          ownerId,
          memberIds: [ownerId],
          createdBy: ownerId,
        })
      );
      if (createProject.fulfilled.match(result)) {
        toast.success("Project created");
        onClose();
      }
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Edit Project" : "New Project"}
      className="max-w-lg"
    >
      {/* API error */}
      {error && <Alert type="error" message={error} className="mb-4" />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        {/* Name */}
        <InputField
          {...register("name")}
          label="Project Name"
          placeholder="e.g. Website Redesign"
          required
          error={errors.name?.message}
        />

        {/* Description — native textarea */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="project-description"
            className="text-xs font-medium"
            style={{ color: "var(--color-heading)" }}
          >
            Description
          </label>
          <textarea
            {...register("description")}
            id="project-description"
            rows={3}
            placeholder="What is this project about?"
            className={cn(
              "w-full resize-none rounded-md border px-3 py-2 text-sm outline-none transition-colors",
              "bg-card-bg text-heading placeholder:text-desc",
              errors.description
                ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                : "border-date-border focus:border-tag-design focus:ring-2 focus:ring-(--tag-design)/20"
            )}
          />
          {errors.description && (
            <p role="alert" className="text-xs text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Row: Category + Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            {...register("category")}
            label="Category"
            required
            options={CATEGORY_OPTIONS}
            error={errors.category?.message}
          />
          <SelectField
            {...register("status")}
            label="Status"
            required
            options={STATUS_OPTIONS}
            error={errors.status?.message}
          />
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 border-t pt-4"
          style={{ borderColor: "var(--color-date-border)" }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
