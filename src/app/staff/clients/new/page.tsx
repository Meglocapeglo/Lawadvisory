import { NewClientForm } from "./new-client-form";

export default function NewClientPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">New client</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Creates a client login with an auto-generated password. Attach them
        to a matter next to grant portal access.
      </p>
      <div className="mt-6">
        <NewClientForm />
      </div>
    </div>
  );
}
