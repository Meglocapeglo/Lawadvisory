import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { sendMessage } from "@/actions/matters";
import { formatDateTime } from "@/lib/format";

export default async function ClientMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matterId = Number(id);
  const user = await getCurrentUser();

  const messages = await prisma.message.findMany({
    where: { matterId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  const sendMessageWithMatter = sendMessage.bind(null, matterId);

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Messages</h2>

      <div className="mt-3 space-y-3">
        {messages.map((message) => {
          const isMe = message.senderId === user.id;
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
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">No messages yet.</p>
        )}
      </div>

      <form action={sendMessageWithMatter} className="mt-6 flex gap-2">
        <textarea
          name="body"
          rows={2}
          required
          placeholder="Write a message…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          className="h-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Send
        </button>
      </form>
    </div>
  );
}
