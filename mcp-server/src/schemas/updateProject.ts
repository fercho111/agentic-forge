import { z } from "zod";

export const updateProjectInputSchema = z.object({
  projectId: z.string().uuid(),
  projectTitle: z.string().optional(),
  finalJson: z.unknown(),
  markdownOutput: z.string().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;