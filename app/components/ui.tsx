import { ReactNode } from "react";

type PanelProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, description, children, className = "" }: PanelProps) {
  return (
    <section className={`rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,42,77,0.05)] ${className}`}>
      {title ? (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-950 px-5 py-6 text-white shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{note}</p>
    </div>
  );
}

export function Badge({ label, variant = "soft" }: { label: string; variant?: "soft" | "solid" }) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  const styles =
    variant === "solid"
      ? "bg-slate-950 text-white"
      : "bg-slate-100 text-slate-700";

  return <span className={`${base} ${styles}`}>{label}</span>;
}

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[] }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80">
      <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">{rows}</tbody>
      </table>
    </div>
  );
}

export function ActionButton({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
      {label}
    </button>
  );
}
