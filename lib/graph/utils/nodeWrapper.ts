import type { GraphRuntime } from "@/lib/runtime/types";
import type { SpecGraphState } from "../state";

type NodeOptions = {
  agentName: string;
  modelName?: "deepseek-chat" | "deepseek-reasoner";
  maxRetries?: number;
};

export function createNodeWrapper(
  runtime: GraphRuntime,
  options: NodeOptions,
  execute: (state: SpecGraphState) => Promise<Partial<SpecGraphState>>
) {
  const maxRetries = options.maxRetries ?? 1;

  return async (state: SpecGraphState): Promise<Partial<SpecGraphState>> => {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const run = await runtime.tools.logAgentRunStart({
        projectId: state.projectId ?? null,
        agentName: options.agentName,
      });

      const step = await runtime.tools.logAgentStepStart({
        projectId: state.projectId ?? null,
        agentName: options.agentName,
        modelName: options.modelName ?? null,
        retryAttempt: attempt,
        inputSnapshot: state,
      });

      try {
        const patch = await execute(state);

        await runtime.tools.logAgentRunEnd({
          runId: run.id,
          status: "success",
        });

        await runtime.tools.logAgentStepEnd({
          stepId: step.id,
          status: "success",
          outputSnapshot: patch,
        });

        return patch;
      } catch (error) {
        lastError = error;

        await runtime.tools.logAgentRunEnd({
          runId: run.id,
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown node error",
        });

        await runtime.tools.logAgentStepEnd({
          stepId: step.id,
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown node error",
        });
      }
    }

    return {
      errors: [
        ...(state.errors ?? []),
        lastError instanceof Error ? lastError.message : "Unknown node error",
      ],
    };
  };
}