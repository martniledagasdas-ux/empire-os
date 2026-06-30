"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProspectModal, type ProspectFormValues } from "./components/prospect-modal";
import { Panel, StatCard } from "./components/ui";

const navItems = [
  { label: "Dashboard", href: "/", icon: "◉" },
  { label: "Prospects", href: "/prospects", icon: "◌" },
  { label: "Follow-ups", href: "/follow-ups", icon: "↺" },
  { label: "Trainings", href: "/training-library", icon: "✦" },
  { label: "Content", href: "/content-library", icon: "▣" },
  { label: "Daily Tasks", href: "/daily-tasks", icon: "◷" },
  { label: "Settings", href: "#", icon: "⚙" },
];

const activityFeed = [
  { title: "New prospect added", meta: "Ava Chen • 10 min ago" },
  { title: "Follow-up completed", meta: "Mina Patel • 34 min ago" },
  { title: "Training module shared", meta: "Jordan Lee • 1 hr ago" },
  { title: "Content draft approved", meta: "Nina Brooks • 2 hrs ago" },
];

type ProspectItem = ProspectFormValues & {
  id: number;
  createdAt: string;
};

const initialProspects: ProspectItem[] = [
  {
    id: 1,
    fullName: "Ava Chen",
    country: "United States",
    phone: "+1 555 0123",
    email: "ava@example.com",
    facebookProfile: "facebook.com/ava",
    interestLevel: "High",
    status: "Follow-up Needed",
    notes: "Interested in premium training bundle.",
    nextFollowUpDate: "2026-07-02",
    createdAt: "Today",
  },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prospects, setProspects] = useState<ProspectItem[]>(initialProspects);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const stats = [
    { label: "Prospects", value: String(prospects.length), note: "+1 from today" },
    { label: "Follow-ups", value: "41", note: "8 due today" },
    { label: "New Members", value: "19", note: "3 joined this morning" },
    { label: "Weekly Activity", value: "86%", note: "Above target" },
  ];

  const quickActions = [
    {
      title: "Add Prospect",
      description: "Capture a new lead",
      action: () => setIsModalOpen(true),
    },
    { title: "Schedule Follow-up", description: "Plan the next touchpoint", action: () => {} },
    { title: "Create Content", description: "Ship a new post", action: () => {} },
    { title: "View Trainings", description: "Open the library", action: () => {} },
  ];

  const handleSaveProspect = (values: ProspectFormValues) => {
    const newProspect: ProspectItem = {
      ...values,
      id: Date.now(),
      createdAt: "Just now",
    };

    setProspects((current) => [newProspect, ...current]);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_34%),linear-gradient(135deg,_#f8fbff_0%,_#f4f7fb_100%)] p-4 text-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:flex-row">
        <aside className="w-full border-b border-slate-200/70 bg-slate-950 px-5 py-6 text-slate-50 xl:w-72 xl:border-b-0 xl:border-r">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-lg font-semibold text-blue-200">
              E
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.25em] text-slate-400">EMPIRE OS</p>
              <h2 className="text-lg font-semibold">Executive Suite</h2>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  item.href === "/"
                    ? "bg-blue-500/20 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Momentum</p>
            <p className="mt-2 text-3xl font-semibold text-blue-200">+24%</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Your pipeline is accelerating this week.</p>
          </div>
        </aside>

        <main className="flex-1 p-5 sm:p-6 lg:p-8">
          <header className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-medium text-blue-600">Welcome back, Mart</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Your dashboard is thriving.</h1>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">Today&apos;s Date</p>
              <p className="mt-1">{today}</p>
            </div>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} note={stat.note} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Panel title="Quick Actions" description="Move fast with the most important tasks." className="bg-slate-50/70">
              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    onClick={action.action}
                    className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="text-sm font-semibold text-slate-950">{action.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Recent Activity" description="A live pulse on the last moves across your team.">
              <div className="space-y-3">
                {activityFeed.map((item) => (
                  <div key={item.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section className="mt-6">
            <Panel title="Mock Prospects" description="Leads captured from the new add prospect flow.">
              <div className="space-y-3">
                {prospects.map((prospect) => (
                  <div key={prospect.id} className="flex flex-col gap-2 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{prospect.fullName}</p>
                      <p className="text-sm text-slate-600">{prospect.country} • {prospect.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span className="rounded-full bg-white px-3 py-1">{prospect.status}</span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{prospect.interestLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        </main>
      </div>

      <ProspectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveProspect} />
    </div>
  );
}
