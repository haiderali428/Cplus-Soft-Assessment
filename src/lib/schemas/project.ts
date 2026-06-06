import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or less"),

  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .or(z.literal("")),

  status: z.enum(["active", "onhold", "completed"], {
    error: "Please select a status",
  }),

  category: z.enum(["design", "planning", "research", "development"], {
    error: "Please select a category",
  }),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
