"use client";

import { useActionState } from "react";
import { resetClientPassword } from "@/actions/clients";

export function ResetPasswordButton({ userId, email }: { userId: number; email: string }) {
  const action = resetClientPassword.bind(null, userId);
  const [state, formAction, pending] = useActionState(action, undefined);

  if (state?.success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm dark:border-green-900 dark:bg-green-950">
        <p className="font-medium text-green-900 dark:text-green-200">Password reset</p>
        <p className="mt-2 text-green-800 dark:text-green-300">
          Share this with the client — it won&apos;t be shown again. Their previous password no
          longer works.
        </p>
        <div className="mt-3 rounded-md bg-white p-3 font-mono text-sm dark:bg-slate-900">
          <p>Email: {email}</p>
          <p>Password: {state.success.password}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!confirm(`Generate a new password for ${email}? Their current password will stop working immediately.`)) {
            e.preventDefault();
          }
        }}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {pending ? "Generating…" : "Generate new password"}
      </button>
      {state?.message && <p className="mt-2 text-sm text-red-600">{state.message}</p>}
    </form>
  );
}
