import { prisma } from "@/lib/prisma";
import { formatDate, formatFileSize } from "@/lib/format";

export default async function ClientDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matterId = Number(id);

  const documents = await prisma.document.findMany({
    where: { matterId, visibleToClient: true },
    include: { currentVersion: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Documents</h2>
      {documents.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No documents shared yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{doc.title}</p>
                {doc.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{doc.description}</p>
                )}
                {doc.currentVersion && (
                  <p className="mt-1 text-xs text-slate-400">
                    {doc.currentVersion.fileName} ·{" "}
                    {formatFileSize(doc.currentVersion.fileSize)} · uploaded{" "}
                    {formatDate(doc.currentVersion.createdAt)}
                  </p>
                )}
              </div>
              {doc.currentVersion && (
                <a
                  href={`/documents/${doc.currentVersion.id}`}
                  className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Download
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
