"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StaffNav() {
  const pathname = usePathname();
  const tabs = [
    { href: "/staff", label: "Matters" },
    { href: "/staff/clients", label: "Clients" },
  ];

  return (
    <nav className="flex gap-1">
      {tabs.map((tab) => {
        const active =
          tab.href === "/staff" ? pathname === "/staff" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              active
                ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
