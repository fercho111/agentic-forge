import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type AgentRun = {
  id: string;
  project_id: string | null;
  agent_name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
};

async function getRuns(): Promise<AgentRun[]> {
  const runs = await sql`
    SELECT
      id,
      project_id,
      agent_name,
      status,
      started_at,
      ended_at,
      duration_ms,
      error_message
    FROM agent_runs
    ORDER BY started_at DESC
    LIMIT 50;
  `;

  return runs as AgentRun[];
}

export default async function RunsPage() {
  const runs = await getRuns();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Agent Runs</h1>
            <p className="text-gray-600">
              Observabilidad del pipeline de agentes: revisa el historial de ejecuciones, errores y resultados.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border bg-white px-4 py-2 text-sm shadow-sm text-gray-500"
          >
            Back to app
          </Link>
        </div>

        <section className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Duration (ms)</th>
                <th className="px-4 py-3">Project ID</th>
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
                    <td className="px-4 py-3">{run.duration_ms ?? "-"}</td>
                    <td className="px-4 py-3">{run.project_id ?? "-"}</td>
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