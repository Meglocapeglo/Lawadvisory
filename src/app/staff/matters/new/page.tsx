import { prisma } from "@/lib/prisma";
import { NewMatterForm } from "./new-matter-form";

export default async function NewMatterPage() {
  const contacts = await prisma.contact.findMany({
    select: { id: true, displayName: true, email: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">New matter</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        The selected client is automatically granted portal access to this matter.
      </p>
      <div className="mt-6">
        <NewMatterForm contacts={contacts} />
      </div>
    </div>
  );
}
