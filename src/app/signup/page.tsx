import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Create your client account
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          We&apos;ll generate a password for you. Your attorney will grant
          access to your matter shortly after.
        </p>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-700 hover:underline dark:text-slate-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
