// lib/llm/generateJson.ts
import { deepseek } from "@/lib/llm/deepseek";

export async function generateJson<T>({
  model = "deepseek-chat",
  systemPrompt,
  userPrompt,
}: {
  model?: "deepseek-chat" | "deepseek-reasoner";
  systemPrompt: string;
  userPrompt: string;
}): Promise<T> {
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