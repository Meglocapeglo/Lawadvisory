import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Staff and clients use the same sign-in — you&apos;ll land on the
          right dashboard automatically.
        </p>
        <LoginForm />
        <div className="mt-6 rounded-md border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Demo accounts (password: password123)
          </p>
          <ul className="mt-2 space-y-1">
            <li>attorney@lawadvisory.test — staff</li>
            <li>client@lawadvisory.test — client</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
