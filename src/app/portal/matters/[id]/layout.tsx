import { notFound } from "next/navigation";
import { requireMatterAccess } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
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
      <div className="mb-6">
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
      <MatterTabs matterId={matterId} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
