import { requireAppSession } from "@/lib/auth/require-app-session";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateProjectInput = {
  rawIdea: string;
  projectTitle?: string;
  finalJson: unknown;
  markdownOutput?: string;
};

export type ProjectRecord = {
  id: string;
  user_id: string;
  raw_idea: string;
  project_title: string | null;
  final_json: unknown;
  markdown_output: string | null;
  created_at: string;
};

export type AgentRunRecord = {
  id: string;
  user_id: string;
  project_id: string | null;
  agent_name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
};

function asProjectRecord(row: unknown): ProjectRecord {
  return row as ProjectRecord;
}

function asAgentRunRecord(row: unknown): AgentRunRecord {
  return row as AgentRunRecord;
}

async function requireAuthenticatedUserId() {
  const session = await requireAppSession();
  const supabase = createAdminClient();

  return { supabase, userId: session.user_id };
}

export async function createProject(
  input: CreateProjectInput
): Promise<ProjectRecord> {
  const { supabase, userId } = await requireAuthenticatedUserId();

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

export async function logAgentRunStart(params: {
  projectId?: string | null;
  agentName: string;
  status?: string;
}): Promise<AgentRunRecord> {
  const { supabase, userId } = await requireAuthenticatedUserId();

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
  const { supabase, userId } = await requireAuthenticatedUserId();

  const { data: existingRun, error: fetchError } = await supabase
    .from("agent_runs")
    .select(
      `
      id,
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
    .eq("user_id", userId)
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
    .eq("user_id", userId)
    .select(
      `
      id,
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

export async function updateProject(params: {
  projectId: string;
  projectTitle?: string;
  finalJson: unknown;
  markdownOutput?: string;
}): Promise<ProjectRecord> {
  const { supabase, userId } = await requireAuthenticatedUserId();

  const { data, error } = await supabase
    .from("projects")
    .update({
      project_title: params.projectTitle ?? null,
      final_json: params.finalJson,
      markdown_output: params.markdownOutput ?? null,
    })
    .eq("id", params.projectId)
    .eq("user_id", userId)
    .select(
      `
      id,
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
