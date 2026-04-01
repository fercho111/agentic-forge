"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function UnlockPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/unlock", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.message || "Contraseña inválida");
            }

            router.push("/");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-black">Demo Protegida</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Ingresa la contraseña de acceso para desbloquear la aplicación.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-3 outline-none focus:border-black text-gray-500"
                            placeholder="Ingresa la contraseña"
                            required
                        />
                    </div>

                    {error ? (
                        <p className="text-sm text-red-600">{error}</p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading || !password.trim()}
                        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Desbloqueando..." : "Desbloquear"}
                    </button>
                </form>
            </div>
        </main>
    );
}