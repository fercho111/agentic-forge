// lib/agents/productAgent.ts
import { SpecState } from "@/lib/types";
import { generateJson } from "@/lib/llm/generateJson";

type ProductOutput = {
  functionalRequirements: string[];
  userStories: string[];
};

export async function runProductAgent(state: SpecState): Promise<SpecState> {
  const result = await generateJson<ProductOutput>({
    model: "deepseek-chat",
    systemPrompt: `
You are a Product Analyst Agent in a multi-agent software specification system.
Given the current project state, produce concise functional requirements and user stories.
Return valid JSON only.
    `.trim(),
    userPrompt: `
Current state:
${JSON.stringify(state, null, 2)}

Return JSON with:
- functionalRequirements: string[]
- userStories: string[]
    `.trim(),
  });

  return {
    ...state,
    functionalRequirements: result.functionalRequirements,
    userStories: result.userStories,
  };
}