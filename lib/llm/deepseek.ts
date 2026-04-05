import OpenAI from "openai";
import { wrapOpenAI } from "langsmith/wrappers";

let cachedClient: ReturnType<typeof wrapOpenAI<OpenAI>> | null = null;

export function getDeepseekClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not defined");
  }

  const baseClient = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey,
  });

  cachedClient = wrapOpenAI(baseClient);
  return cachedClient;
}