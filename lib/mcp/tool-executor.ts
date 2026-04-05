import type { ToolExecutor } from "@/lib/runtime/types";
import { createMcpClient } from "./client";
import { localToolExecutor } from "@/lib/runtime/local-tool-executor";
import { requireAppSession } from "@/lib/auth/require-app-session";

export const mcpToolExecutor: ToolExecutor = {
  async createProject(input) {
    return await localToolExecutor.createProject(input);
  },

  async updateProject(input) {
    const client = await createMcpClient();

    try {
      const result = await client.callTool({
        name: "update_project",
        arguments: {
          projectId: input.projectId,
          projectTitle: input.projectTitle,
          finalJson: input.finalJson,
          markdownOutput: input.markdownOutput,
        },
      });

      const structured = result.structuredContent as
        | { project?: unknown }
        | undefined;

      if (!structured?.project) {
        throw new Error("MCP update_project returned no project");
      }

      return structured.project as Awaited<
        ReturnType<ToolExecutor["updateProject"]>
      >;
    } finally {
      await client.close();
    }
  },

  async logAgentRunStart(input) {
    return await localToolExecutor.logAgentRunStart(input);
  },

  async logAgentRunEnd(input) {
    return await localToolExecutor.logAgentRunEnd(input);
  },

  async logAgentStepStart(input) {
    const session = await requireAppSession();
    const client = await createMcpClient();

    try {
      const result = await client.callTool({
        name: "log_agent_step_start",
        arguments: {
          userId: session.user_id,
          projectId: input.projectId ?? null,
          agentName: input.agentName,
          modelName: input.modelName ?? null,
          retryAttempt: input.retryAttempt ?? 0,
          inputSnapshot: input.inputSnapshot,
          traceName: input.traceName ?? null,
        },
      });

      const structured = result.structuredContent as
        | { step?: unknown }
        | undefined;

      if (!structured?.step) {
        throw new Error("MCP log_agent_step_start returned no step");
      }

      return structured.step as Awaited<
        ReturnType<ToolExecutor["logAgentStepStart"]>
      >;
    } finally {
      await client.close();
    }
  },

  async logAgentStepEnd(input) {
    const client = await createMcpClient();

    try {
      const result = await client.callTool({
        name: "log_agent_step_end",
        arguments: {
          stepId: input.stepId,
          status: input.status,
          outputSnapshot: input.outputSnapshot,
          errorMessage: input.errorMessage ?? null,
        },
      });

      const structured = result.structuredContent as
        | { step?: unknown }
        | undefined;

      if (!structured?.step) {
        throw new Error("MCP log_agent_step_end returned no step");
      }

      return structured.step as Awaited<
        ReturnType<ToolExecutor["logAgentStepEnd"]>
      >;
    } finally {
      await client.close();
    }
  },

  async checkAnalyzeRateLimit(input) {
    return await localToolExecutor.checkAnalyzeRateLimit(input);
  },

  async exportMarkdown(input) {
    const client = await createMcpClient();

    try {
      const result = await client.callTool({
        name: "export_markdown",
        arguments: {
          projectTitle: input.projectTitle,
          problemSummary: input.problemSummary,
          targetUsers: input.targetUsers,
          functionalRequirements: input.functionalRequirements,
          userStories: input.userStories,
          technicalProposal: input.technicalProposal,
          dataEntities: input.dataEntities,
          openQuestions: input.openQuestions,
          reviewNotes: input.reviewNotes,
        },
      });

      const structured = result.structuredContent as
        | { markdown?: string }
        | undefined;

      if (!structured?.markdown) {
        throw new Error("MCP export_markdown returned no markdown");
      }

      return structured.markdown;
    } finally {
      await client.close();
    }
  },
};