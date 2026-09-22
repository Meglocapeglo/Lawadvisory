import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { ResetPasswordButton } from "./reset-password-button";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contactId = Number(id);

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      user: true,
      matterLinks: {
        include: { matter: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contact) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/staff/clients" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200">
          ← All clients
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
          {contact.displayName}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {contact.email ?? "No email on file"}
          {contact.phone ? ` · ${contact.phone}` : ""}
          {contact.company ? ` · ${contact.company}` : ""}
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Portal account</h2>
        <div className="mt-3 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {contact.user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="text-slate-900 dark:text-slate-50">{contact.user.email}</p>
                  <p className="text-xs text-slate-400">
                    Account created {formatDate(contact.user.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {contact.user.role}
                </span>
              </div>
              <ResetPasswordButton userId={contact.user.id} email={contact.user.email} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              This contact doesn&apos;t have a client portal login yet. Create one from{" "}
              <Link href="/staff/clients/new" className="underline">
                New client
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Matters</h2>
        <ul className="mt-3 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {contact.matterLinks.map((link) => (
            <li key={link.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <Link
                  href={`/staff/matters/${link.matter.id}`}
                  className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                >
                  {link.matter.title}
                </Link>
                <p className="text-xs text-slate-400">
                  {link.role} · opened {formatDate(link.matter.openedAt)}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  link.portalAccess
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {link.portalAccess ? "Portal access granted" : "No portal access"}
              </span>
            </li>
          ))}
          {contact.matterLinks.length === 0 && (
            <li className="p-4 text-sm text-slate-500">Not linked to any matters yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
