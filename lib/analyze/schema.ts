import { z } from "zod";

function normalizeIdea(value: string) {
  return value
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

const suspiciousPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /disregard\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now/i,
  /act\s+as\s+an?/i,
  /system\s+prompt/i,
  /developer\s+message/i,
  /reveal\s+(your\s+)?prompt/i,
  /tool\s+call/i,
  /function\s+call/i,
  /override\s+instructions/i,
];

export const analyzeIdeaSchema = z.object({
  idea: z
    .string()
    .transform(normalizeIdea)
    .refine((value) => value.length >= 20, {
      message: "Idea must be at least 20 characters long",
    })
    .refine((value) => value.length <= 4000, {
      message: "Idea must be at most 4000 characters long",
    })
    .refine(
      (value) => !suspiciousPatterns.some((pattern) => pattern.test(value)),
      {
        message:
          "Input appears to contain instruction-like content unrelated to the project idea",
      }
    ),
});

export type AnalyzeIdeaInput = z.infer<typeof analyzeIdeaSchema>;