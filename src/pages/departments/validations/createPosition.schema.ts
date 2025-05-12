import { z } from "zod";

export const positionSchema = z.object({
  title: z.string().min(1, "Position title is required"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
});

export type PositionFormData = z.infer<typeof positionSchema>;
