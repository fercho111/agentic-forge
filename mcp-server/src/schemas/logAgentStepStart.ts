import { z } from "zod";

export const logAgentStepStartInputSchema = z.object({
  userId: z.uuid(),
  projectId: z.uuid().nullable().optional(),
  agentName: z.string().min(1),
  modelName: z.string().nullable().optional(),
  retryAttempt: z.number().int().nonnegative().optional(),
  inputSnapshot: z.unknown().optional(),
  traceName: z.string().nullable().optional(),
});

export type LogAgentStepStartInput = z.infer<typeof logAgentStepStartInputSchema>;