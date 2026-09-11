"use client";

import { useActionState } from "react";
import { signup } from "@/actions/auth";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  if (state?.success) {
    return (
      <div className="mt-8 rounded-md border border-green-200 bg-green-50 p-4 text-sm dark:border-green-900 dark:bg-green-950">
        <p className="font-medium text-green-900 dark:text-green-200">Account created</p>
        <p className="mt-2 text-green-800 dark:text-green-300">
          Save this password now — it won&apos;t be shown again.
        </p>
        <div className="mt-3 rounded-md bg-white p-3 font-mono text-sm dark:bg-slate-900">
          <p>Email: {state.success.email}</p>
          <p>Password: {state.success.password}</p>
        </div>
        <a
          href="/login"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900"
        >
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        {state?.errors?.name && <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        {state?.errors?.email && <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>}
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex h-10 w-full items-center justify-center rounded-md bg-slate-900 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
