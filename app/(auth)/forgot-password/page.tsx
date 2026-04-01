"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "../actions";

const initialState = {
  error: undefined,
  success: undefined,
};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-black">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-gray-600">
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
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

          {state?.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}

          {state?.success ? (
            <p className="text-sm text-green-600">{state.success}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          <Link href="/login" className="text-blue-600">
            Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}