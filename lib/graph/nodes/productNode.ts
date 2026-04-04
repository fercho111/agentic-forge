import type { GraphRuntime } from "@/lib/runtime/types";
import type { SpecGraphState } from "../state";
import { createNodeWrapper } from "../utils/nodeWrapper";

type ProductOutput = {
  functionalRequirements: string[];
  userStories: string[];
};

export function createProductNode(runtime: GraphRuntime) {
  return createNodeWrapper(
    runtime,
    {
      agentName: "product-agent",
      modelName: "deepseek-chat",
      maxRetries: 1,
    },
    async (state: SpecGraphState): Promise<Partial<SpecGraphState>> => {
      const result = await runtime.llm.generateStructured<ProductOutput>({
        model: "deepseek-chat",
        systemPrompt: `
You are the Product Agent in a multi-agent software specification workflow.
Your job is to transform the current project context into concise functional requirements and user stories.

Return valid JSON only.
        `.trim(),
        userPrompt: `
Current project state:
${JSON.stringify(state, null, 2)}

Return JSON with:
- functionalRequirements: string[]
- userStories: string[]
        `.trim(),
      });

      return {
        currentAgent: "product",
        functionalRequirements: result.functionalRequirements,
        userStories: result.userStories,
      };
    }
  );
}