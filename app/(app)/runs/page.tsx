import Link from "next/link";
import { requireAppSessionForPage } from "@/lib/auth/require-app-session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type AgentRunRow = {
  id: string;
  project_id: string | null;
  agent_name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  projects: {
    project_title: string | null;
  } | null;
};

type AgentRun = {
  id: string;
  project_id: string | null;
  project_title: string | null;
  agent_name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
};

async function getRuns(userId: string): Promise<AgentRun[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("agent_runs")
    .select(`
      id,
      project_id,
      agent_name,
      status,
      started_at,
      ended_at,
      duration_ms,
      error_message,
      projects (
        project_title
      )
    `)
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch agent runs: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as AgentRunRow[];

  return rows.map((row) => ({
    id: row.id,
    project_id: row.project_id,
    project_title: row.projects?.project_title ?? null,
    agent_name: row.agent_name,
    status: row.status,
    started_at: row.started_at,
    ended_at: row.ended_at,
    duration_ms: row.duration_ms,
    error_message: row.error_message,
  }));
}

export default async function RunsPage() {
  const session = await requireAppSessionForPage();
  const runs = await getRuns(session.user_id);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Agent Runs</h1>
            <p className="text-gray-600">
              Observabilidad del pipeline de agentes: revisa el historial de
              ejecuciones, errores y resultados.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border bg-white px-4 py-2 text-sm shadow-sm text-gray-500"
          >
            Volver
          </Link>
        </div>

        <section className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Duration (s)</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Error</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {runs.length > 0 ? (
                runs.map((run) => (
                  <tr key={run.id} className="border-t">
                    <td className="px-4 py-3">{run.agent_name}</td>
                    <td className="px-4 py-3">{run.status}</td>
                    <td className="px-4 py-3">
                      {new Date(run.started_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {run.duration_ms != null
                        ? (run.duration_ms / 1000).toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {run.project_title ?? run.project_id ?? "-"}
                    </td>
                    <td className="px-4 py-3">{run.error_message ?? "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={6}>
                    No runs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}