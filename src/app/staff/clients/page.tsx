import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ClientsListPage() {
  const clients = await prisma.contact.findMany({
    where: { user: { role: "CLIENT" } },
    include: { user: true, matterLinks: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Clients</h1>
        <Link
          href="/staff/clients/new"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900"
        >
          New client
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Matters</th>
              <th className="px-4 py-3">Portal access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/staff/clients/${client.id}`}
                    className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                  >
                    {client.displayName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {client.user?.email}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {client.matterLinks.length}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {client.matterLinks.some((l) => l.portalAccess) ? "Granted" : "Not granted"}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
