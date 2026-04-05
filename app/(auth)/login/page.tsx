"use client";

import Link from "next/link";
import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "No fue posible iniciar sesión");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setPending(false);
    }
  }

  // async function handleGoogleLogin() {
  //   const supabase = createClient();
  //   const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

  //   await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: {
  //       redirectTo: `${origin}/auth/callback?next=/`,
  //     },
  //   });
  // }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-black">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-gray-600">
          Accede a Agentic Forge con tu cuenta.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* <button
          onClick={handleGoogleLogin}
          className="mt-4 w-full rounded-md border px-4 py-2 text-sm text-gray-700"
        >
          Continuar con Google
        </button> */}

        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-blue-600">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link href="/register" className="text-blue-600">
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
