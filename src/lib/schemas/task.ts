import { z } from "zod";

export const addTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  category: z.enum(["design", "planning", "research", "development"], {
    error: "Select a category",
  }),
  bannerImage: z
    .string()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), {
      message: "Must be a valid URL starting with http(s)://",
    })
    .optional(),
  priority: z.enum(["low", "medium", "high"], {
    error: "Select a priority",
  }),
  dueDate: z.string().optional(),
  assignedUser: z.string().optional(),
  status: z.enum(
    ["backlog", "todo", "inprogress", "review_qa", "rejection", "completed"],
    { error: "Select a status" }
  ),
  projectId: z.string().min(1, "Select a project"),
});

export type AddTaskFormValues = z.infer<typeof addTaskSchema>;
