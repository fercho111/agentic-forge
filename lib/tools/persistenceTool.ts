import type {
  AgentRunRecord,
  AgentStepRecord,
  CreateProjectInput,
  ProjectRecord,
  RateLimitResult,
} from "@/lib/runtime/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppSessionFromCookies } from "@/lib/auth/get-app-session";

function asProjectRecord(row: unknown): ProjectRecord {
  return row as ProjectRecord;
}

function asAgentRunRecord(row: unknown): AgentRunRecord {
  return row as AgentRunRecord;
}

function asAgentStepRecord(row: unknown): AgentStepRecord {
  return row as AgentStepRecord;
}

async function requireAppSessionContext() {
  const session = await getAppSessionFromCookies();

  if (!session) {
    throw new Error("Unauthorized: no active app session");
  }

  const supabase = createAdminClient();

  return {
    supabase,
    userId: session.user_id,
    session,
  };
}

export async function createProject(
  input: CreateProjectInput
): Promise<ProjectRecord> {
  const { supabase, userId } = await requireAppSessionContext();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      raw_idea: input.rawIdea,
      project_title: input.projectTitle ?? null,
      final_json: input.finalJson,
      markdown_output: input.markdownOutput ?? null,
    })
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
    throw new Error(error?.message || "Failed to create project");
  }

  return asProjectRecord(data);
}

export async function updateProject(params: {
  projectId: string;
  projectTitle?: string;
  finalJson: unknown;
  markdownOutput?: string;
}): Promise<ProjectRecord> {
  const { supabase } = await requireAppSessionContext();

  const { data, error } = await supabase
    .from("projects")
    .update({
      project_title: params.projectTitle ?? null,
      final_json: params.finalJson,
      markdown_output: params.markdownOutput ?? null,
    })
    .eq("id", params.projectId)
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

  return asProjectRecord(data);
}

export async function logAgentRunStart(params: {
  projectId?: string | null;
  agentName: string;
  status?: string;
}): Promise<AgentRunRecord> {
  const { supabase, userId } = await requireAppSessionContext();

  const { data, error } = await supabase
    .from("agent_runs")
    .insert({
      user_id: userId,
      project_id: params.projectId ?? null,
      agent_name: params.agentName,
      status: params.status ?? "running",
    })
    .select(
      `
      id,
      user_id,
      project_id,
      agent_name,
      status,
      started_at,
      ended_at,
      duration_ms,
      error_message
    `
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to log agent run start");
  }

  return asAgentRunRecord(data);
}

export async function logAgentRunEnd(params: {
  runId: string;
  status: "success" | "failed";
  errorMessage?: string | null;
}): Promise<AgentRunRecord> {
  const { supabase } = await requireAppSessionContext();

  const { data: existingRun, error: fetchError } = await supabase
    .from("agent_runs")
    .select(
      `
      id,
      user_id,
      project_id,
      agent_name,
      status,
      started_at,
      ended_at,
      duration_ms,
      error_message
    `
    )
    .eq("id", params.runId)
    .single();

  if (fetchError || !existingRun) {
    throw new Error(fetchError?.message || "Failed to fetch agent run");
  }

  const endedAt = new Date();
  const startedAt = new Date(existingRun.started_at);
  const durationMs = Math.max(0, endedAt.getTime() - startedAt.getTime());

  const { data, error } = await supabase
    .from("agent_runs")
    .update({
      status: params.status,
      ended_at: endedAt.toISOString(),
      duration_ms: durationMs,
      error_message: params.errorMessage ?? null,
    })
    .eq("id", params.runId)
    .select(
      `
      id,
      user_id,
      project_id,
      agent_name,
      status,
      started_at,
      ended_at,
      duration_ms,
      error_message
    `
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to log agent run end");
  }

  return asAgentRunRecord(data);
}

export async function logAgentStepStart(params: {
  projectId?: string | null;
  agentName: string;
  modelName?: string | null;
  retryAttempt?: number;
  inputSnapshot?: unknown;
  traceName?: string | null;
}): Promise<AgentStepRecord> {
  const { supabase, userId } = await requireAppSessionContext ();

  const { data, error } = await supabase
    .from("agent_steps")
    .insert({
      user_id: userId,
      project_id: params.projectId ?? null,
      agent_name: params.agentName,
      model_name: params.modelName ?? null,
      retry_attempt: params.retryAttempt ?? 0,
      status: "running",
      input_snapshot: params.inputSnapshot ?? null,
      trace_name: params.traceName ?? null,
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

  return asAgentStepRecord(data);
}

export async function logAgentStepEnd(params: {
  stepId: string;
  status: "success" | "failed";
  outputSnapshot?: unknown;
  errorMessage?: string | null;
}): Promise<AgentStepRecord> {
  const { supabase } = await requireAppSessionContext ();

  const { data: existingStep, error: fetchError } = await supabase
    .from("agent_steps")
    .select(
      `
      id,
      started_at
    `
    )
    .eq("id", params.stepId)
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
      status: params.status,
      ended_at: endedAt.toISOString(),
      duration_ms: durationMs,
      output_snapshot: params.outputSnapshot ?? null,
      error_message: params.errorMessage ?? null,
    })
    .eq("id", params.stepId)
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

  return asAgentStepRecord(data);
}

export async function checkAnalyzeRateLimit(params: {
  userId: string;
  route: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("check_and_increment_rate_limit", {
    p_user_id: params.userId,
    p_route: params.route,
    p_limit: params.limit,
    p_window_seconds: params.windowSeconds,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    throw new Error(error?.message || "Failed to check rate limit");
  }

  return data[0] as RateLimitResult;
}