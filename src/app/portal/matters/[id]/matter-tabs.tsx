"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MatterTabs({ matterId }: { matterId: number }) {
  const pathname = usePathname();
  const base = `/portal/matters/${matterId}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/documents`, label: "Documents" },
    { href: `${base}/invoices`, label: "Invoices" },
    { href: `${base}/messages`, label: "Messages" },
  ];

  return (
    <nav className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-2 text-sm font-medium ${
              active
                ? "border-b-2 border-slate-900 text-slate-900 dark:border-slate-50 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
