import Link from "next/link";
import { ReactNode } from "react";
import { navItems } from "../../lib/mock-data";

type PageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,42,77,0.08)] sm:flex sm:items-end sm:justify-between sm:p-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-500">Empire OS</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 sm:mt-0 sm:justify-end">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
              Dashboard
            </Link>
            <a href="#" className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              Team Support
            </a>
          </div>
        </header>

        <nav className="mb-6 flex flex-wrap gap-3 rounded-[1.75rem] bg-slate-950/5 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-950/10 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
