import { z } from "zod";

export const exportMarkdownInputSchema = z.object({
  projectTitle: z.string().optional(),
  problemSummary: z.string().optional(),
  targetUsers: z.array(z.string()).optional(),
  functionalRequirements: z.array(z.string()).optional(),
  userStories: z.array(z.string()).optional(),
  technicalProposal: z.array(z.string()).optional(),
  dataEntities: z.array(z.string()).optional(),
  openQuestions: z.array(z.string()).optional(),
  reviewNotes: z.array(z.string()).optional(),
});

export type ExportMarkdownInput = z.infer<typeof exportMarkdownInputSchema>;