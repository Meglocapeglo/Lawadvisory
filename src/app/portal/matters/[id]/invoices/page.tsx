import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  VOID: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
};

export default async function ClientInvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matterId = Number(id);

  const invoices = await prisma.invoice.findMany({
    where: { matterId, status: { not: "DRAFT" } },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Invoices</h2>
      {invoices.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No invoices yet.</p>
      ) : (
        <div className="mt-3 space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {invoice.number}
                  </p>
                  <p className="text-xs text-slate-500">
                    {invoice.issuedAt ? `Issued ${formatDate(invoice.issuedAt)}` : ""}
                    {invoice.dueAt ? ` · Due ${formatDate(invoice.dueAt)}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[invoice.status]}`}
                >
                  {invoice.status}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {invoice.lines.map((line) => (
                  <li key={line.id} className="flex justify-between gap-4">
                    <span>{line.description}</span>
                    <span className="shrink-0">{formatCurrency(line.amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-50">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
