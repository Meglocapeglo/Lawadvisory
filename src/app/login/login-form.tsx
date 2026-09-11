"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-brand-brass focus:outline-none focus:ring-1 focus:ring-brand-brass dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
        {state?.errors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
        {state?.errors?.password && (
          <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-md bg-brand-navy text-sm font-medium tracking-wide text-white transition-colors hover:bg-brand-navy-deep disabled:opacity-60 dark:bg-brand-brass dark:text-brand-navy-deep dark:hover:bg-brand-brass-hover"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
