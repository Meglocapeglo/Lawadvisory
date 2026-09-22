import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { logout } from "@/actions/auth";
import { BrandMark } from "@/components/brand-mark";
import { StaffNav } from "@/components/staff-nav";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("STAFF", "ADMIN");

  return (
    <div className="flex min-h-full flex-col bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/staff" className="flex items-center gap-2">
            <BrandMark
              className="text-brand-navy dark:text-slate-50"
              iconClassName="h-5 w-5 text-brand-brass"
              textClassName="text-base"
            />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Staff</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {user.name} · {user.role}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-2">
          <StaffNav />
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
