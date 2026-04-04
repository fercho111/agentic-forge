import type { ToolExecutor } from "./types";
import {
  createProject,
  updateProject,
  logAgentRunStart,
  logAgentRunEnd,
  logAgentStepStart,
  logAgentStepEnd,
  checkAnalyzeRateLimit,
} from "@/lib/tools/persistenceTool";
import { toMarkdown } from "@/lib/tools/exportTool";

export const localToolExecutor: ToolExecutor = {
  async createProject(input) {
    return await createProject(input);
  },

  async updateProject(input) {
    return await updateProject(input);
  },

  async logAgentRunStart(input) {
    return await logAgentRunStart(input);
  },

  async logAgentRunEnd(input) {
    return await logAgentRunEnd(input);
  },

  async logAgentStepStart(input) {
    return await logAgentStepStart(input);
  },

  async logAgentStepEnd(input) {
    return await logAgentStepEnd(input);
  },

  async checkAnalyzeRateLimit(input) {
    return await checkAnalyzeRateLimit(input);
  },

  async exportMarkdown(input) {
    return toMarkdown({
      rawIdea: "",
      projectTitle: input.projectTitle,
      problemSummary: input.problemSummary,
      targetUsers: input.targetUsers,
      functionalRequirements: input.functionalRequirements,
      userStories: input.userStories,
      technicalProposal: input.technicalProposal,
      dataEntities: input.dataEntities,
      openQuestions: input.openQuestions,
      reviewNotes: input.reviewNotes,
    });
  },
};