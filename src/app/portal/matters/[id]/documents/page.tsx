import { prisma } from "@/lib/prisma";
import { formatDate, formatFileSize } from "@/lib/format";
import { uploadEvidence } from "@/actions/matters";

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

  const uploadEvidenceWithMatter = uploadEvidence.bind(null, matterId);

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

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Upload evidence
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Share anything relevant to your case with your attorney — photos, videos,
          receipts, correspondence, or documents. Large video files are supported (up to 150MB).
        </p>
        <form
          action={uploadEvidenceWithMatter}
          className="mt-3 flex flex-wrap items-end gap-3 rounded-md border border-dashed border-slate-300 p-4 dark:border-slate-700"
        >
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Title</label>
            <input
              name="title"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">File</label>
            <input
              type="file"
              name="file"
              required
              className="mt-1 w-full text-sm text-slate-600 dark:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}
