import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

const skillCache = new Map<string, string>();

export async function loadSkill(skillName: string): Promise<string> {
  if (skillCache.has(skillName)) {
    return skillCache.get(skillName)!;
  }

  const skillPath = path.join(process.cwd(), "skills", skillName, "SKILL.md");
  const content = await readFile(skillPath, "utf-8");

  skillCache.set(skillName, content);
  return content;
}