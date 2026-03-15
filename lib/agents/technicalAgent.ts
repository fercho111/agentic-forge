// lib/agents/technicalAgent.ts
import { SpecState } from "@/lib/types";
import { generateJson } from "@/lib/llm/generateJson";

type TechnicalOutput = {
  technicalProposal: string[];
  dataEntities: string[];
};

export async function runTechnicalAgent(state: SpecState): Promise<SpecState> {
  const result = await generateJson<TechnicalOutput>({
    model: "deepseek-chat",
    systemPrompt: `
You are a Technical Architect Agent in a multi-agent software specification system.
Produce a minimal, realistic technical proposal and likely core data entities.
Return valid JSON only.
    `.trim(),
    userPrompt: `
Current state:
${JSON.stringify(state, null, 2)}

Return JSON with:
- technicalProposal: string[]
- dataEntities: string[]
    `.trim(),
  });

  return {
    ...state,
    technicalProposal: result.technicalProposal,
    dataEntities: result.dataEntities,
  };
}