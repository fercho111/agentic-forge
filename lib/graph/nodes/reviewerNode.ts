import type { GraphRuntime } from "@/lib/runtime/types";
import type { SpecGraphState } from "../state";
import { createNodeWrapper } from "../utils/nodeWrapper";
import { loadSkill } from "@/lib/skills/load-skill";

type ReviewerOutput = {
  openQuestions: string[];
  reviewNotes: string[];
  shouldRework?: boolean;
};

export function createReviewerNode(runtime: GraphRuntime) {
  return createNodeWrapper(
    runtime,
    {
      agentName: "reviewer-agent",
      modelName: "deepseek-chat",
      maxRetries: 1,
    },
    async (state: SpecGraphState): Promise<Partial<SpecGraphState>> => {
      const reviewerSkill = await loadSkill("spec-review");

      const result = await runtime.llm.generateStructured<ReviewerOutput>({
        model: "deepseek-chat",
        systemPrompt: `
You are the Reviewer Agent in a multi-agent software specification workflow.

You have access to the following reusable skill. Follow it as the authoritative review procedure for this step.

${reviewerSkill}

Return valid JSON only.
        `.trim(),
        userPrompt: `
Current project state:
${JSON.stringify(state, null, 2)}

Return JSON with:
- openQuestions: string[]
- reviewNotes: string[]
- shouldRework: boolean
        `.trim(),
      });

      return {
        currentAgent: "reviewer",
        openQuestions: result.openQuestions,
        reviewNotes: result.reviewNotes,
        shouldRework: result.shouldRework ?? false,
      };
    }
  );
}