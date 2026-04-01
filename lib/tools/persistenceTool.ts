import { createClient } from "@/lib/supabase/server";

export async function createProject(input: {
  rawIdea: string;
  projectTitle?: string;
  finalJson: unknown;
  markdownOutput?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      raw_idea: input.rawIdea,
      project_title: input.projectTitle ?? null,
      final_json: input.finalJson,
      markdown_output: input.markdownOutput ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}