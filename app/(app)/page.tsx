"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type SpecState = {
  rawIdea: string;
  projectTitle?: string;
  problemSummary?: string;
  targetUsers?: string[];
  functionalRequirements?: string[];
  userStories?: string[];
  technicalProposal?: string[];
  dataEntities?: string[];
  openQuestions?: string[];
  reviewNotes?: string[];
};

type AnalyzeResponse = {
  ok: boolean;
  projectId?: string;
  spec?: SpecState;
  markdown?: string;
  message?: string;
};

function SectionList({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  return (
    <section className="rounded-lg border p-4 bg-white shadow-sm text-gray-900">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>

      {items && items.length > 0 ? (
        <ul className="list-disc pl-5 space-y-1 text-gray-800">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No items generated.</p>
      )}
    </section>
  );
}

export default function HomePage() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to analyze idea");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Agentic Forge</h1>
            <p className="text-gray-600">
            Convierte una idea de software en una primera especificación técnica
            utilizando un pipeline mínimo de múltiples agentes.
            </p>
            <Link
              href="/runs"
              className="text-blue-500 hover:text-blue-700"
            >
              Ver historial de ejecuciones
            </Link>
        </header>

        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="idea"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Describe la idea de proyecto
              </label>
              <textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ejemplo: Quiero una aplicación web que ayude a los equipos pequeños a convertir ideas de clientes en requisitos técnicos estructurados..."
                className="text-gray-900 min-h-45 w-full rounded-md border border-gray-300 p-3 outline-none focus:border-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !idea.trim()}
              className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analizando..." : "Generar especificaciones"}
            </button>
          </form>
        </section>

        {error ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </section>
        ) : null}

        {result?.spec ? (
          <div className="space-y-6">
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-2">
                Project ID: {result.projectId}
              </p>
              <h2 className="text-2xl font-bold text-black">
                {result.spec.projectTitle || "Untitled Project"}
              </h2>
              <p className="mt-3 text-gray-700">
                {result.spec.problemSummary || "No summary generated."}
              </p>
            </section>

            <SectionList title="Target Users" items={result.spec.targetUsers} />
            <SectionList
              title="Functional Requirements"
              items={result.spec.functionalRequirements}
            />
            <SectionList title="User Stories" items={result.spec.userStories} />
            <SectionList
              title="Technical Proposal"
              items={result.spec.technicalProposal}
            />
            <SectionList
              title="Data Entities"
              items={result.spec.dataEntities}
            />
            <SectionList
              title="Open Questions"
              items={result.spec.openQuestions}
            />
            <SectionList
              title="Review Notes"
              items={result.spec.reviewNotes}
            />

            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-black">Markdown Export</h2>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-gray-100 p-4 text-sm text-gray-800">
                {result.markdown}
              </pre>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}