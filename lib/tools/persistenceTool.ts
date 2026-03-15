import { sql } from "@/lib/db";

export type CreateProjectInput = {
  rawIdea: string;
  projectTitle?: string;
  finalJson: unknown;
  markdownOutput?: string;
};

export type ProjectRecord = {
  id: string;
  raw_idea: string;
  project_title: string | null;
  final_json: unknown;
  markdown_output: string | null;
  created_at: string;
};

export type AgentRunRecord = {
  id: string;
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

export async function createProject(
  input: CreateProjectInput
): Promise<ProjectRecord> {
  const result = await sql`
    INSERT INTO projects (
      raw_idea,
      project_title,
      final_json,
      markdown_output
    )
    VALUES (
      ${input.rawIdea},
      ${input.projectTitle ?? null},
      ${JSON.stringify(input.finalJson)},
      ${input.markdownOutput ?? null}
    )
    RETURNING
      id,
      raw_idea,
      project_title,
      final_json,
      markdown_output,
      created_at;
  `;

  const row = result[0];

  if (!row) {
    throw new Error("Failed to create project: no row returned");
  }

  return asProjectRecord(row);
}

export async function logAgentRunStart(params: {
  projectId?: string | null;
  agentName: string;
  status?: string;
}): Promise<AgentRunRecord> {
  const result = await sql`
    INSERT INTO agent_runs (
      project_id,
      agent_name,
      status,
      started_at
    )
    VALUES (
      ${params.projectId ?? null},
      ${params.agentName},
      ${params.status ?? "running"},
      NOW()
    )
    RETURNING
      id,
      project_id,
      agent_name,
      status,
      started_at,
      ended_at,
      duration_ms,
      error_message;
  `;

  const row = result[0];

  if (!row) {
    throw new Error("Failed to log agent run start: no row returned");
  }

  return asAgentRunRecord(row);
}

export async function logAgentRunEnd(params: {
  runId: string;
  status: "success" | "failed";
  errorMessage?: string | null;
}): Promise<AgentRunRecord> {
  const result = await sql`
    UPDATE agent_runs
    SET
      status = ${params.status},
      ended_at = NOW(),
      duration_ms = FLOOR(EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000)::int,
      error_message = ${params.errorMessage ?? null}
    WHERE id = ${params.runId}
    RETURNING
      id,
      project_id,
      agent_name,
      status,
      started_at,
      ended_at,
      duration_ms,
      error_message;
  `;

  const row = result[0];

  if (!row) {
    throw new Error("Failed to log agent run end: no row returned");
  }

  return asAgentRunRecord(row);
}