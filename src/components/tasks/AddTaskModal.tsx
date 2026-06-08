"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { createTask, updateTask } from "@/store/tasksSlice";
import { fetchProjects } from "@/store/projectsSlice";
import { closeModal, clearEditingTask } from "@/store/uiSlice";
import { useUsers } from "@/hooks/useUsers";
import { Task } from "@/types";
import { addTaskSchema, AddTaskFormValues } from "@/lib/schemas/task";

import { Modal } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

// Option lists 

const CATEGORY_OPTIONS = [
  { value: "design",      label: "Design"      },
  { value: "planning",    label: "Planning"    },
  { value: "research",    label: "Research"    },
  { value: "development", label: "Development" },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low"    },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High"   },
];

const STATUS_OPTIONS = [
  { value: "backlog",    label: "Backlog"      },
  { value: "todo",       label: "To Do"        },
  { value: "inprogress", label: "In Progress"  },
  { value: "review_qa",  label: "Review / QA"  },
  { value: "rejection",  label: "Rejection"    },
  { value: "completed",  label: "Completed"    },
];

// Helpers───

function taskToFormValues(task: Task): AddTaskFormValues {
  return {
    title:        task.title,
    description:  task.description  ?? "",
    category:     task.category,
    bannerImage:  task.bannerImage  ?? "",
    priority:     task.priority,
    dueDate:      task.dueDate      ?? "",
    assignedUser: task.assignedUser ?? "",
    status:       task.status,
    projectId:    task.projectId    ?? "",
  };
}

const EMPTY_VALUES: AddTaskFormValues = {
  title:        "",
  description:  "",
  category:     "design",
  bannerImage:  "",
  priority:     "medium",
  dueDate:      "",
  assignedUser: "",
  status:       "todo",
  projectId:    "",
};

// Component─

interface AddTaskModalProps {
  /** When provided, the modal operates in edit mode. */
  task?: Task;
}

export function AddTaskModal({ task }: AddTaskModalProps) {
  const isEdit = Boolean(task);
  const dispatch = useAppDispatch();

  const { loading: taskLoading, error: taskError } = useAppSelector((s) => s.tasks);
  const { items: projects, loading: projectsLoading } = useAppSelector((s) => s.projects);
  const currentUser = useAppSelector((s) => s.auth.user);
  const isAdmin = currentUser?.role === "admin";

  // Admin or the task's creator can edit all fields.
  // A plain member editing someone else's task can only change status.
  const canEditAll = !isEdit || isAdmin || task?.createdBy === currentUser?.id;

  const { users, loading: usersLoading, error: usersError } = useUsers();

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const userOptions    = users.map((u) => ({ value: u.id, label: u.name }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddTaskFormValues>({
    resolver:      zodResolver(addTaskSchema),
    defaultValues: isEdit && task ? taskToFormValues(task) : EMPTY_VALUES,
  });

  // Re-seed the form whenever the edited task changes (or modal opens in create mode)
  useEffect(() => {
    reset(isEdit && task ? taskToFormValues(task) : EMPTY_VALUES);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  // Ensure projects are loaded for the project select
  useEffect(() => {
    if (projects.length === 0) dispatch(fetchProjects());
  }, [projects.length, dispatch]);

  const onClose = () => {
    if (isEdit) {
      dispatch(clearEditingTask());
    } else {
      dispatch(closeModal());
    }
  };

  const onSubmit = async (data: AddTaskFormValues) => {
    const payload = {
      title:        data.title,
      description:  data.description  || undefined,
      category:     data.category,
      bannerImage:  data.bannerImage  || undefined,
      priority:     data.priority,
      dueDate:      data.dueDate      || undefined,
      // Preserve existing assignee when non-admins edit (field is hidden for them)
      assignedUser: isAdmin ? (data.assignedUser || undefined) : task?.assignedUser,
      status:       data.status,
      projectId:    data.projectId    || undefined,
    };

    if (isEdit && task) {
      const result = await dispatch(updateTask({ id: task.id, data: payload }));
      if (updateTask.fulfilled.match(result)) {
        toast.success("Task updated");
        onClose();
      }
    } else {
      const result = await dispatch(createTask({ ...payload, createdBy: currentUser?.id }));
      if (createTask.fulfilled.match(result)) {
        toast.success("Task created");
        onClose();
      }
    }
  };

  return (
    <Modal
      open
      title={isEdit ? "Edit Task" : "Add New Task"}
      onClose={onClose}
      className="max-w-2xl"
    >
      {taskError && <Alert type="error" message={taskError} className="mb-4" />}

      {/* Status-only restriction notice */}
      {isEdit && !canEditAll && (
        <div
          className="mb-4 rounded-md border px-3 py-2 text-xs"
          style={{
            borderColor: "var(--color-date-border)",
            background: "var(--color-date-bg)",
            color: "var(--color-desc)",
          }}
        >
          You can only update the <strong style={{ color: "var(--color-heading)" }}>status</strong> of tasks you don&apos;t own.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        {/* Title */}
        <InputField
          {...register("title")}
          label="Title"
          placeholder="e.g. Design onboarding screens"
          required
          disabled={!canEditAll}
          error={errors.title?.message}
        />

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="task-description"
            className="text-xs font-medium"
            style={{ color: "var(--color-heading)" }}
          >
            Description
          </label>
          <textarea
            {...register("description")}
            id="task-description"
            rows={3}
            placeholder="What needs to be done?"
            disabled={!canEditAll}
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

        {/* Row: Category + Priority */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            {...register("category")}
            label="Category"
            required
            disabled={!canEditAll}
            options={CATEGORY_OPTIONS}
            error={errors.category?.message}
          />
          <SelectField
            {...register("priority")}
            label="Priority"
            required
            disabled={!canEditAll}
            options={PRIORITY_OPTIONS}
            error={errors.priority?.message}
          />
        </div>

        {/* Row: Status + Due Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            {...register("status")}
            label="Status"
            required
            options={STATUS_OPTIONS}
            error={errors.status?.message}
          />
          <InputField
            {...register("dueDate")}
            type="date"
            label="Due Date"
            disabled={!canEditAll}
            error={errors.dueDate?.message}
          />
        </div>

        {/* Project (required) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="task-projectId"
            className="text-xs font-medium"
            style={{ color: "var(--color-heading)" }}
          >
            Project <span aria-hidden style={{ color: "var(--tag-design)" }}>*</span>
          </label>
          {projectsLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Spinner size="sm" />
              <span className="text-xs" style={{ color: "var(--color-desc)" }}>
                Loading projects…
              </span>
            </div>
          ) : (
            <SelectField
              {...register("projectId")}
              id="task-projectId"
              placeholder="— Select project —"
              disabled={!canEditAll}
              options={projectOptions}
              error={errors.projectId?.message}
            />
          )}
        </div>

        {/* Banner Image URL */}
        <InputField
          {...register("bannerImage")}
          type="url"
          label="Banner Image URL"
          placeholder="https://example.com/image.jpg"
          disabled={!canEditAll}
          error={errors.bannerImage?.message}
        />

        {/* Assigned User — admin only */}
        {isAdmin && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="task-assignedUser"
              className="text-xs font-medium"
              style={{ color: "var(--color-heading)" }}
            >
              Assigned User
            </label>
            {usersLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner size="sm" />
                <span className="text-xs" style={{ color: "var(--color-desc)" }}>
                  Loading users…
                </span>
              </div>
            ) : usersError ? (
              <p role="alert" className="py-1 text-xs text-red-500">
                Could not load users: {usersError}
              </p>
            ) : users.length === 0 ? (
              <p className="py-1 text-xs" style={{ color: "var(--color-desc)" }}>
                No users found.
              </p>
            ) : (
              <SelectField
                {...register("assignedUser")}
                id="task-assignedUser"
                placeholder="— Unassigned —"
                options={userOptions}
                error={errors.assignedUser?.message}
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex justify-end gap-3 border-t pt-4"
          style={{ borderColor: "var(--color-date-border)" }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={taskLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={taskLoading}
            disabled={taskLoading}
          >
            {isEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
