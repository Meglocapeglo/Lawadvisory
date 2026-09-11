import { notFound } from "next/navigation";
import { requireMatterAccess } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { MatterTabs } from "./matter-tabs";

export default async function MatterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matterId = Number(id);
  await requireMatterAccess(matterId);

  const matter = await prisma.matter.findUnique({ where: { id: matterId } });
  if (!matter) notFound();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {matter.title}
          </h1>
          {matter.caseNumber && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Case #{matter.caseNumber}
              {matter.jurisdiction ? ` · ${matter.jurisdiction}` : ""}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-slate-400">Retainer balance due</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {formatCurrency(matter.retainerBalance)}
          </p>
        </div>
      </div>
      <MatterTabs matterId={matterId} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
