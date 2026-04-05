import { createAdminSupabaseClient } from "../supabase.js";
import {
  logAgentStepEndInputSchema,
  type LogAgentStepEndInput,
} from "../schemas/logAgentStepEnd.js";

export async function logAgentStepEnd(input: LogAgentStepEndInput) {
  const parsed = logAgentStepEndInputSchema.parse(input);
  const supabase = createAdminSupabaseClient();

  const { data: existingStep, error: fetchError } = await supabase
    .from("agent_steps")
    .select("id, started_at")
    .eq("id", parsed.stepId)
    .single();

  if (fetchError || !existingStep) {
    throw new Error(fetchError?.message || "Failed to fetch agent step");
  }

  const endedAt = new Date();
  const startedAt = new Date(existingStep.started_at);
  const durationMs = Math.max(0, endedAt.getTime() - startedAt.getTime());

  const { data, error } = await supabase
    .from("agent_steps")
    .update({
      status: parsed.status,
      ended_at: endedAt.toISOString(),
      duration_ms: durationMs,
      output_snapshot: parsed.outputSnapshot ?? null,
      error_message: parsed.errorMessage ?? null,
    })
    .eq("id", parsed.stepId)
    .select(
      `
      id,
      user_id,
      project_id,
      agent_name,
      model_name,
      retry_attempt,
      status,
      input_snapshot,
      output_snapshot,
      error_message,
      trace_name,
      started_at,
      ended_at,
      duration_ms,
      created_at
    `
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to log agent step end");
  }

  return data;
}

export const logAgentStepEndToolMeta = {
  name: "log_agent_step_end",
  description:
    "Finalize a structured agent step record with completion status, output snapshot, and timing.",
  inputSchema: logAgentStepEndInputSchema,
};