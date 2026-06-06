"use client";

import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { deleteProject } from "@/store/projectsSlice";
import { Project } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface DeleteProjectModalProps {
  project:  Project;
  onClose:  () => void;
}

export function DeleteProjectModal({ project, onClose }: DeleteProjectModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.projects);

  const handleDelete = async () => {
    const result = await dispatch(deleteProject(project.id));
    if (deleteProject.fulfilled.match(result)) {
      toast.success(`"${project.name}" deleted`);
      onClose();
    } else {
      toast.error("Failed to delete project");
    }
  };

  return (
    <Modal open onClose={onClose} title="Delete Project" className="max-w-md">

      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Warning icon + message */}
      <div className="flex gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: "color-mix(in srgb, #EF4444 12%, transparent)" }}
        >
          <AlertTriangle size={20} className="text-red-500" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: "var(--color-heading)" }}>
            Are you sure you want to delete{" "}
            <strong className="font-semibold">&ldquo;{project.name}&rdquo;</strong>?
          </p>
          <p className="text-sm" style={{ color: "var(--color-desc)" }}>
            This action cannot be undone. The project and all its associated data will
            be permanently removed.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div
        className="mt-6 flex justify-end gap-3 border-t pt-4"
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
          type="button"
          variant="danger"
          loading={loading}
          disabled={loading}
          onClick={handleDelete}
        >
          Delete Project
        </Button>
      </div>
    </Modal>
  );
}
