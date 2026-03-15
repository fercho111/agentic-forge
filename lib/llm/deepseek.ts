import OpenAI from "openai";
import { wrapOpenAI } from "langsmith/wrappers";

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error("DEEPSEEK_API_KEY is not defined");
}

const baseClient = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const deepseek = wrapOpenAI(baseClient);