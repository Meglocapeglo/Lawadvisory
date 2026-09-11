import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      subtitle="Staff and clients use the same sign-in — you'll land on the right dashboard automatically."
      footer={
        <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400">
          <Link href="/forgot-password" className="hover:text-brand-navy dark:hover:text-slate-200">
            Forgot password?
          </Link>
          <Link href="/signup" className="hover:text-brand-navy dark:hover:text-slate-200">
            Client sign up
          </Link>
        </div>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
