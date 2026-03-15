// lib/agents/reviewerAgent.ts
import { SpecState } from "@/lib/types";
import { generateJson } from "@/lib/llm/generateJson";

type ReviewerOutput = {
  openQuestions: string[];
  reviewNotes: string[];
};

export async function runReviewerAgent(state: SpecState): Promise<SpecState> {
  const result = await generateJson<ReviewerOutput>({
    model: "deepseek-reasoner",
    systemPrompt: `
You are a Reviewer Agent in a multi-agent software specification system.
Review the current state for ambiguity, missing information, and implementation risks.
Return valid JSON only.
    `.trim(),
    userPrompt: `
Current state:
${JSON.stringify(state, null, 2)}

Return JSON with:
- openQuestions: string[]
- reviewNotes: string[]
    `.trim(),
  });

  return {
    ...state,
    openQuestions: result.openQuestions,
    reviewNotes: result.reviewNotes,
  };
}