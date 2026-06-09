import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  children: ReactNode;
}

export function StatCard({ title, children }: StatCardProps) {
  return (
    <section className="rounded-lg border border-slate-200/80 bg-white/85 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
