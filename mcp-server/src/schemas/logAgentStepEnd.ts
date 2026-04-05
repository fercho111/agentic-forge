import { z } from "zod";

export const logAgentStepEndInputSchema = z.object({
  stepId: z.uuid(),
  status: z.enum(["success", "failed"]),
  outputSnapshot: z.unknown().optional(),
  errorMessage: z.string().nullable().optional(),
});

export type LogAgentStepEndInput = z.infer<typeof logAgentStepEndInputSchema>;