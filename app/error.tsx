"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-red-600">Application error</h1>
        <p className="mt-3 text-gray-700">
          Something went wrong while rendering the application.
        </p>
        <p className="mt-2 text-sm text-gray-500">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-black px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    </main>
  );
}