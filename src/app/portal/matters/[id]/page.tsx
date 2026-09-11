import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/format";

export default async function MatterOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matterId = Number(id);

  const [tasks, events] = await Promise.all([
    prisma.task.findMany({
      where: { matterId, visibleToClient: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.event.findMany({
      where: { matterId, visibleToClient: true },
      orderBy: { start: "asc" },
    }),
  ]);

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Upcoming events
        </h2>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No upcoming events.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="font-medium text-slate-900 dark:text-slate-50">{event.title}</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {formatDateTime(event.start)}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Case tasks
        </h2>
        {tasks.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No tasks to show.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900 dark:text-slate-50">{task.title}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                {task.dueDate && (
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Due {formatDate(task.dueDate)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
