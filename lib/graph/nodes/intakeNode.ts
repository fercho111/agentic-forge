import type { GraphRuntime } from "@/lib/runtime/types";
import type { SpecGraphState } from "../state";
import { createNodeWrapper } from "../utils/nodeWrapper";

type IntakeOutput = {
  projectTitle: string;
  problemSummary: string;
  targetUsers: string[];
};

export function createIntakeNode(runtime: GraphRuntime) {
  return createNodeWrapper(
    runtime,
    {
      agentName: "intake-agent",
      modelName: "deepseek-chat",
      maxRetries: 1,
    },
    async (state: SpecGraphState): Promise<Partial<SpecGraphState>> => {
      const result = await runtime.llm.generateStructured<IntakeOutput>({
        model: "deepseek-chat",
        systemPrompt: `
You are the Intake Agent in a multi-agent software specification workflow.
Your job is to interpret a raw project idea and extract only the foundational framing.

Return valid JSON only.
        `.trim(),
        userPrompt: `
Raw project idea:
${state.rawIdea}

Return JSON with:
- projectTitle: string
- problemSummary: string
- targetUsers: string[]
        `.trim(),
      });

      return {
        currentAgent: "intake",
        projectTitle: result.projectTitle,
        problemSummary: result.problemSummary,
        targetUsers: result.targetUsers,
      };
    }
  );
}