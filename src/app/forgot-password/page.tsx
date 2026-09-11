import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Enter your account email and we&apos;ll send a new password to it.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-slate-700 hover:underline dark:text-slate-300">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
