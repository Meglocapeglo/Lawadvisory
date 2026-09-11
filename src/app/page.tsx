import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Lawadvisory Client Portal
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Secure access to your matters, documents, invoices, and case
          messages.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
