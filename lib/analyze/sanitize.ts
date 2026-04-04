export function sanitizeIdeaForPrompt(rawIdea: string): string {
  return rawIdea
    .replace(/```/g, "")
    .replace(/<script/gi, "")
    .replace(/<\/script>/gi, "")
    .trim();
}