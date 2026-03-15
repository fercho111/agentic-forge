import { traceable } from "langsmith/traceable";
import { SpecState } from "@/lib/types";
import { generateJson } from "@/lib/llm/generateJson";

type TechnicalOutput = {
  technicalProposal: string[];
  dataEntities: string[];
};

async function _runTechnicalAgent(state: SpecState): Promise<SpecState> {
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

export const runTechnicalAgent = traceable(_runTechnicalAgent, {
  name: "technical-agent",
  run_type: "chain",
});