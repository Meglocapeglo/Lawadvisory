import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-brand-paper px-6 py-12 dark:bg-slate-950">
      <Link href="/" className="mb-8">
        <BrandMark
          className="text-brand-navy dark:text-slate-50"
          iconClassName="h-7 w-7 text-brand-brass"
          textClassName="text-xl"
        />
      </Link>

      <div className="w-full max-w-sm overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="h-1 bg-brand-brass" />
        <div className="p-8">
          <h1 className="font-serif text-2xl text-brand-navy dark:text-slate-50">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          {children}
        </div>
      </div>

      {footer && <div className="mt-6 text-sm">{footer}</div>}
    </div>
  );
}
