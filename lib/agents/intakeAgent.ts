import { traceable } from "langsmith/traceable";
import { SpecState } from "@/lib/types";
import { generateJson } from "@/lib/llm/generateJson";

type IntakeOutput = {
  projectTitle: string;
  problemSummary: string;
  targetUsers: string[];
};

async function _runIntakeAgent(rawIdea: string): Promise<SpecState> {
  const result = await generateJson<IntakeOutput>({
    model: "deepseek-chat",
    systemPrompt: `
You are an Intake Agent in a multi-agent software specification system.
Extract only the core project framing.
Return valid JSON only.
    `.trim(),
    userPrompt: `
Raw idea:
${rawIdea}

Return JSON with:
- projectTitle: string
- problemSummary: string
- targetUsers: string[]
    `.trim(),
  });

  return {
    rawIdea,
    projectTitle: result.projectTitle,
    problemSummary: result.problemSummary,
    targetUsers: result.targetUsers,
  };
}

export const runIntakeAgent = traceable(_runIntakeAgent, {
  name: "intake-agent",
  run_type: "chain",
});