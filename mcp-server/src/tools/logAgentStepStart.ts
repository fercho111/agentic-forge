import { createAdminSupabaseClient } from "../supabase.js";
import {
  logAgentStepStartInputSchema,
  type LogAgentStepStartInput,
} from "../schemas/logAgentStepStart.js";

export async function logAgentStepStart(input: LogAgentStepStartInput) {
  const parsed = logAgentStepStartInputSchema.parse(input);
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("agent_steps")
    .insert({
      user_id: parsed.userId,
      project_id: parsed.projectId ?? null,
      agent_name: parsed.agentName,
      model_name: parsed.modelName ?? null,
      retry_attempt: parsed.retryAttempt ?? 0,
      status: "running",
      input_snapshot: parsed.inputSnapshot ?? null,
      trace_name: parsed.traceName ?? null,
    })
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
    throw new Error(error?.message || "Failed to log agent step start");
  }

  return data;
}

export const logAgentStepStartToolMeta = {
  name: "log_agent_step_start",
  description:
    "Create a structured persistence record for the beginning of an agent step execution.",
  inputSchema: logAgentStepStartInputSchema,
};