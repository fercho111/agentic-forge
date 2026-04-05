import { createAdminSupabaseClient } from "../supabase.js";
import {
  updateProjectInputSchema,
  type UpdateProjectInput,
} from "../schemas/updateProject.js";

export async function updateProject(input: UpdateProjectInput) {
  const parsed = updateProjectInputSchema.parse(input);
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("projects")
    .update({
      project_title: parsed.projectTitle ?? null,
      final_json: parsed.finalJson,
      markdown_output: parsed.markdownOutput ?? null,
    })
    .eq("id", parsed.projectId)
    .select(
      `
      id,
      user_id,
      raw_idea,
      project_title,
      final_json,
      markdown_output,
      created_at
    `
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update project");
  }

  return data;
}

export const updateProjectToolMeta = {
  name: "update_project",
  description:
    "Update the final project record with the completed structured output and markdown export.",
  inputSchema: updateProjectInputSchema,
};