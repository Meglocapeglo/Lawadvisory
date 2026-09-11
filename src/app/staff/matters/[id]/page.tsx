import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import {
  setPortalAccess,
  toggleDocumentVisibility,
  uploadDocument,
  sendMessage,
  adjustRetainer,
} from "@/actions/matters";
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from "@/lib/format";

export default async function StaffMatterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matterId = Number(id);
  const currentUser = await getCurrentUser();

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: {
      billToContact: true,
      contacts: { include: { contact: true } },
      responsible: { include: { user: true } },
      documents: {
        include: { currentVersion: { include: { uploadedBy: true } } },
        orderBy: { createdAt: "desc" },
      },
      tasks: { orderBy: { dueDate: "asc" } },
      events: { orderBy: { start: "asc" } },
      invoices: { include: { lines: true }, orderBy: { createdAt: "desc" } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!matter) notFound();

  const sendMessageWithMatter = sendMessage.bind(null, matterId);
  const adjustRetainerWithMatter = adjustRetainer.bind(null, matterId);

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{matter.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {matter.caseNumber && `#${matter.caseNumber} · `}
            {matter.jurisdiction} · Bill to {matter.billToContact.displayName}
          </p>
          {matter.responsible.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Responsible: {matter.responsible.map((r) => `${r.user.name}${r.title ? ` (${r.title})` : ""}`).join(", ")}
            </p>
          )}
        </div>
        <form action={adjustRetainerWithMatter} className="shrink-0 text-right">
          <label className="block text-xs text-slate-400">Retainer balance due</label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              step="0.01"
              name="retainerBalance"
              defaultValue={matter.retainerBalance.toString()}
              className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900"
            >
              Update
            </button>
          </div>
        </form>
      </div>

      {/* Client portal access */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Client portal access</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Access is opt-in per client. Grant it once a matter is ready for the client to see.
        </p>
        <ul className="mt-3 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {matter.contacts.map((mc) => (
            <li key={mc.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {mc.contact.displayName}
                </span>
                <span className="ml-2 text-xs text-slate-400">{mc.role}</span>
              </div>
              {mc.role === "CLIENT" && (
                <form action={setPortalAccess.bind(null, matterId, mc.contactId, !mc.portalAccess)}>
                  <button
                    type="submit"
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                      mc.portalAccess
                        ? "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900"
                    }`}
                  >
                    {mc.portalAccess ? "Revoke access" : "Grant portal access"}
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Documents */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Documents</h2>
        <ul className="mt-3 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {matter.documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-4 p-3 text-sm">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-50">{doc.title}</p>
                {doc.currentVersion && (
                  <p className="text-xs text-slate-400">
                    {doc.currentVersion.fileName} · {formatFileSize(doc.currentVersion.fileSize)} ·{" "}
                    {formatDate(doc.currentVersion.createdAt)} · uploaded by{" "}
                    {doc.currentVersion.uploadedBy.name}
                    {doc.currentVersion.uploadedBy.role === "CLIENT" ? " (client)" : ""}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {doc.currentVersion && (
                  <a
                    href={`/documents/${doc.currentVersion.id}`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Download
                  </a>
                )}
                <form action={toggleDocumentVisibility.bind(null, doc.id, matterId, !doc.visibleToClient)}>
                  <button
                    type="submit"
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                      doc.visibleToClient
                        ? "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900"
                    }`}
                  >
                    {doc.visibleToClient ? "Visible to client" : "Hidden from client"}
                  </button>
                </form>
              </div>
            </li>
          ))}
          {matter.documents.length === 0 && (
            <li className="p-3 text-sm text-slate-500">No documents uploaded yet.</li>
          )}
        </ul>

        <form
          action={uploadDocument}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-dashed border-slate-300 p-4 dark:border-slate-700"
        >
          <input type="hidden" name="matterId" value={matterId} />
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
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input type="checkbox" name="visibleToClient" />
            Visible to client
          </label>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900"
          >
            Upload
          </button>
        </form>
      </section>

      {/* Tasks & Events */}
      <section className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Tasks</h2>
          <ul className="mt-3 space-y-2">
            {matter.tasks.map((task) => (
              <li
                key={task.id}
                className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-slate-50">{task.title}</span>
                  <span className="text-xs text-slate-400">{task.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {task.visibleToClient ? "Visible to client" : "Internal only"}
                  {task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}
                </p>
              </li>
            ))}
            {matter.tasks.length === 0 && <p className="text-sm text-slate-500">No tasks.</p>}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Events</h2>
          <ul className="mt-3 space-y-2">
            {matter.events.map((event) => (
              <li
                key={event.id}
                className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="font-medium text-slate-900 dark:text-slate-50">{event.title}</p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(event.start)}
                  {event.location ? ` · ${event.location}` : ""} ·{" "}
                  {event.visibleToClient ? "Visible to client" : "Internal only"}
                </p>
              </li>
            ))}
            {matter.events.length === 0 && <p className="text-sm text-slate-500">No events.</p>}
          </ul>
        </div>
      </section>

      {/* Invoices */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Invoices</h2>
        <div className="mt-3 space-y-3">
          {matter.invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900 dark:text-slate-50">{invoice.number}</span>
                <span className="text-xs text-slate-400">{invoice.status}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Total {formatCurrency(invoice.total)}</p>
            </div>
          ))}
          {matter.invoices.length === 0 && <p className="text-sm text-slate-500">No invoices yet.</p>}
        </div>
      </section>

      {/* Messages */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Messages</h2>
        <div className="mt-3 space-y-3">
          {matter.messages.map((message) => {
            const isMe = message.senderId === currentUser.id;
            return (
              <div
                key={message.id}
                className={`max-w-md rounded-md border p-3 text-sm ${
                  isMe
                    ? "ml-auto border-slate-900 bg-slate-900 text-white dark:border-slate-50 dark:bg-slate-50 dark:text-slate-900"
                    : "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
                }`}
              >
                <p className={`text-xs font-medium ${isMe ? "opacity-70" : "text-slate-500 dark:text-slate-400"}`}>
                  {message.sender.name} · {formatDateTime(message.createdAt)}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
              </div>
            );
          })}
          {matter.messages.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
        </div>
        <form action={sendMessageWithMatter} className="mt-4 flex gap-2">
          <textarea
            name="body"
            rows={2}
            required
            placeholder="Message the client…"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="submit"
            className="h-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
