import Link from "next/link";
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
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200">
            Forgot password?
          </Link>
          <Link href="/signup" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200">
            Client sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
