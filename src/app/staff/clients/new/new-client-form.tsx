"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createClient } from "@/actions/clients";

export function NewClientForm() {
  const [state, formAction, pending] = useActionState(createClient, undefined);

  if (state?.success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm dark:border-green-900 dark:bg-green-950">
        <p className="font-medium text-green-900 dark:text-green-200">Client account created</p>
        <p className="mt-2 text-green-800 dark:text-green-300">
          Share this password with the client — it won&apos;t be shown again.
        </p>
        <div className="mt-3 rounded-md bg-white p-3 font-mono text-sm dark:bg-slate-900">
          <p>Email: {state.success.email}</p>
          <p>Password: {state.success.password}</p>
        </div>
        <div className="mt-4 flex gap-3">
          <Link
            href="/staff/matters/new"
            className="inline-flex h-9 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900"
          >
            Create a matter for them
          </Link>
          <Link
            href="/staff"
            className="inline-flex h-9 items-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Client name
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
          Client email
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
        className="flex h-10 w-full items-center justify-center rounded-md bg-slate-900 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-50 dark:text-slate-900"
      >
        {pending ? "Creating…" : "Create client account"}
      </button>
    </form>
  );
}
