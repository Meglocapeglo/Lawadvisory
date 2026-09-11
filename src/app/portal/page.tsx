import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function PortalDashboard() {
  const user = await getCurrentUser();

  const links = await prisma.matterContact.findMany({
    where: { contactId: user.contactId ?? -1, portalAccess: true },
    include: {
      matter: {
        include: {
          responsible: { include: { user: true } },
        },
      },
    },
    orderBy: { matter: { openedAt: "desc" } },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        Your matters
      </h1>

      {links.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          You don&apos;t have access to any matters yet. Your attorney will
          grant portal access once your matter is set up.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {links.map(({ matter }) => (
            <Link
              key={matter.id}
              href={`/portal/matters/${matter.id}`}
              className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-slate-900 dark:text-slate-50">
                  {matter.title}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {matter.status}
                </span>
              </div>
              {matter.caseNumber && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Case #{matter.caseNumber}
                </p>
              )}
              <p className="mt-3 text-xs text-slate-400">
                Opened {formatDate(matter.openedAt)}
              </p>
              {matter.responsible.length > 0 && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {matter.responsible
                    .map((r) => `${r.user.name}${r.title ? ` (${r.title})` : ""}`)
                    .join(", ")}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
