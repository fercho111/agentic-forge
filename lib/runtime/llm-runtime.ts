import type { GraphRuntime, LLMRuntime, LLMStructuredRequest } from "./types";
import { generateJson } from "@/lib/llm/generateJson";
import { mcpToolExecutor } from "@/lib/mcp/tool-executor";

const llmRuntime: LLMRuntime = {
  async generateStructured<T>(input: LLMStructuredRequest): Promise<T> {
    return await generateJson<T>({
      model: input.model,
      systemPrompt: input.systemPrompt,
      userPrompt: input.userPrompt,
    });
  },
};

export const localGraphRuntime: GraphRuntime = {
  llm: llmRuntime,
  tools: mcpToolExecutor,
};