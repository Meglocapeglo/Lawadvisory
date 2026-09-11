import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your client account"
      subtitle="We'll generate a password for you. Your attorney will grant access to your matter shortly after."
      footer={
        <p className="text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-navy hover:underline dark:text-slate-200">
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
