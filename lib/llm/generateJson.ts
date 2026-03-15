import { traceable } from "langsmith/traceable";
import { deepseek } from "@/lib/llm/deepseek";

type GenerateJsonParams = {
  model?: "deepseek-chat" | "deepseek-reasoner";
  systemPrompt: string;
  userPrompt: string;
};

async function _generateJson<T>({
  model = "deepseek-chat",
  systemPrompt,
  userPrompt,
}: GenerateJsonParams): Promise<T> {
  const response = await deepseek.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Model returned empty content");
  }

  return JSON.parse(content) as T;
}

type GenerateJsonFn = <T>(params: GenerateJsonParams) => Promise<T>;

export const generateJson = traceable(_generateJson, {
  name: "generate-json",
  run_type: "llm",
}) as GenerateJsonFn;