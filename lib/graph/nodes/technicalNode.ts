import type { GraphRuntime } from "@/lib/runtime/types";
import type { SpecGraphState } from "../state";
import { createNodeWrapper } from "../utils/nodeWrapper";

type TechnicalOutput = {
  technicalProposal: string[];
  dataEntities: string[];
};

export function createTechnicalNode(runtime: GraphRuntime) {
  return createNodeWrapper(
    runtime,
    {
      agentName: "technical-agent",
      modelName: "deepseek-chat",
      maxRetries: 1,
    },
    async (state: SpecGraphState): Promise<Partial<SpecGraphState>> => {
      const result = await runtime.llm.generateStructured<TechnicalOutput>({
        model: "deepseek-chat",
        systemPrompt: `
You are the Technical Agent in a multi-agent software specification workflow.
Your job is to propose a realistic technical approach and likely core data entities.

Return valid JSON only.
        `.trim(),
        userPrompt: `
Current project state:
${JSON.stringify(state, null, 2)}

Return JSON with:
- technicalProposal: string[]
- dataEntities: string[]
        `.trim(),
      });

      return {
        currentAgent: "technical",
        technicalProposal: result.technicalProposal,
        dataEntities: result.dataEntities,
      };
    }
  );
}