import Link from "next/link";
import { BrandMark, ScalesIcon } from "@/components/brand-mark";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-brand-paper dark:bg-slate-950">
      <header className="border-b border-black/5 px-6 py-5 dark:border-white/10 sm:px-10">
        <BrandMark
          className="text-brand-navy dark:text-slate-50"
          iconClassName="h-6 w-6 text-brand-brass"
          textClassName="text-xl"
        />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy text-brand-brass shadow-sm dark:bg-slate-900">
          <ScalesIcon className="h-8 w-8" />
        </div>

        <h1 className="mt-8 max-w-xl text-center font-serif text-4xl leading-tight text-brand-navy dark:text-slate-50 sm:text-5xl">
          Your case, always within reach
        </h1>
        <p className="mt-4 max-w-md text-center text-base leading-relaxed text-slate-600 dark:text-slate-400">
          A secure, private portal to your matters, documents, evidence,
          invoices, and direct messages with your attorney.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-md bg-brand-navy px-8 text-sm font-medium tracking-wide text-white transition-colors hover:bg-brand-navy-deep dark:bg-brand-brass dark:text-brand-navy-deep dark:hover:bg-brand-brass-hover"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-md border border-brand-navy/20 px-8 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            New client? Create an account
          </Link>
        </div>
      </main>

      <footer className="border-t border-black/5 px-6 py-6 text-center text-xs text-slate-400 dark:border-white/10 sm:px-10">
        Protected by encrypted, attorney-controlled access.
      </footer>
    </div>
  );
}
