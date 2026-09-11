"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createMatter } from "@/actions/matters";

type Contact = { id: number; displayName: string; email: string | null };

export function NewMatterForm({ contacts }: { contacts: Contact[] }) {
  const [state, formAction, pending] = useActionState(createMatter, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Matter title
        </label>
        <input
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        {state?.errors?.title && <p className="mt-1 text-sm text-red-600">{state.errors.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="billToContactId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Client
        </label>
        <select
          id="billToContactId"
          name="billToContactId"
          required
          defaultValue=""
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="" disabled>
            Select a client…
          </option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.displayName} {c.email ? `(${c.email})` : ""}
            </option>
          ))}
        </select>
        {state?.errors?.billToContactId && (
          <p className="mt-1 text-sm text-red-600">{state.errors.billToContactId[0]}</p>
        )}
        {contacts.length === 0 && (
          <p className="mt-1 text-xs text-slate-500">
            No client accounts yet —{" "}
            <Link href="/staff/clients/new" className="underline">
              create one first
            </Link>
            .
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="caseNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Case number
          </label>
          <input
            id="caseNumber"
            name="caseNumber"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div>
          <label htmlFor="jurisdiction" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Jurisdiction
          </label>
          <input
            id="jurisdiction"
            name="jurisdiction"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="matterType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Matter type
          </label>
          <input
            id="matterType"
            name="matterType"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div>
          <label htmlFor="retainerBalance" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Initial retainer balance
          </label>
          <input
            id="retainerBalance"
            name="retainerBalance"
            type="number"
            step="0.01"
            defaultValue="0"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending || contacts.length === 0}
        className="flex h-10 w-full items-center justify-center rounded-md bg-slate-900 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-50 dark:text-slate-900"
      >
        {pending ? "Creating…" : "Create matter & grant portal access"}
      </button>
    </form>
  );
}
