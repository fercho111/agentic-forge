"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "../actions";

const initialState = {
  error: undefined,
  success: undefined,
};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-black">
          Restablecer contraseña
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Define una nueva contraseña para tu cuenta.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900"
            />
          </div>

          {state?.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}