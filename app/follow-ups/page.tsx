"use client";

import { useState } from "react";
import { PageShell } from "../components/page-shell";
import { Panel, Badge } from "../components/ui";

type FollowUpItem = {
  id: number;
  prospectName: string;
  status: string;
  interestLevel: "Low" | "Medium" | "High";
  nextFollowUpDate: string;
  notes: string;
  lastContactDate: string;
};

type ModalMode = "notes" | "reschedule" | "profile";

type ModalState = { type: ModalMode; item: FollowUpItem } | null;

const initialFollowUps: FollowUpItem[] = [
  {
    id: 1,
    prospectName: "Ava Sullivan",
    status: "Scheduled",
    interestLevel: "High",
    nextFollowUpDate: "2026-06-30",
    notes: "Discussed a leadership bundle and requested a sample proposal.",
    lastContactDate: "2026-06-28",
  },
  {
    id: 2,
    prospectName: "Elijah Reed",
    status: "Scheduled",
    interestLevel: "Medium",
    nextFollowUpDate: "2026-07-01",
    notes: "Waiting on pricing feedback from his team.",
    lastContactDate: "2026-06-27",
  },
  {
    id: 3,
    prospectName: "Nora Patel",
    status: "Scheduled",
    interestLevel: "High",
    nextFollowUpDate: "2026-07-03",
    notes: "Asked for onboarding support and a full demo walkthrough.",
    lastContactDate: "2026-06-29",
  },
  {
    id: 4,
    prospectName: "Milo Grant",
    status: "Scheduled",
    interestLevel: "Low",
    nextFollowUpDate: "2026-06-25",
    notes: "Follow-up is overdue after no response to the initial invitation.",
    lastContactDate: "2026-06-20",
  },
  {
    id: 5,
    prospectName: "Lina Brooks",
    status: "Completed",
    interestLevel: "High",
    nextFollowUpDate: "2026-06-29",
    notes: "Completed the call and confirmed the training enrollment.",
    lastContactDate: "2026-06-29",
  },
];

const filterOptions = ["Today", "Tomorrow", "This Week", "Overdue", "Completed"];

function normalizeDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Today");
  const [modalState, setModalState] = useState<ModalState>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [draftDate, setDraftDate] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const dueTodayCount = followUps.filter(
    (item) => item.status !== "Completed" && normalizeDate(item.nextFollowUpDate).getTime() === today.getTime()
  ).length;

  const overdueCount = followUps.filter((item) => {
    const dueDate = normalizeDate(item.nextFollowUpDate);
    return item.status !== "Completed" && dueDate < today;
  }).length;

  const filteredFollowUps = followUps.filter((item) => {
    const matchesSearch = item.prospectName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) {
      return false;
    }

    const dueDate = normalizeDate(item.nextFollowUpDate);
    const isCompleted = item.status === "Completed";
    const isOverdue = !isCompleted && dueDate < today;
    const isDueToday = !isCompleted && dueDate.getTime() === today.getTime();
    const isDueTomorrow = !isCompleted && dueDate.getTime() === tomorrow.getTime();
    const isThisWeek = !isCompleted && dueDate >= today && dueDate <= weekEnd;

    switch (activeFilter) {
      case "Today":
        return isDueToday;
      case "Tomorrow":
        return isDueTomorrow;
      case "This Week":
        return isThisWeek;
      case "Overdue":
        return isOverdue;
      case "Completed":
        return isCompleted;
      default:
        return true;
    }
  });

  const dueToday = filteredFollowUps.filter(
    (item) => item.status !== "Completed" && normalizeDate(item.nextFollowUpDate).getTime() === today.getTime()
  );
  const upcoming = filteredFollowUps.filter((item) => {
    const dueDate = normalizeDate(item.nextFollowUpDate);
    return item.status !== "Completed" && dueDate > today && dueDate.getTime() !== tomorrow.getTime();
  });
  const overdue = filteredFollowUps.filter((item) => item.status !== "Completed" && normalizeDate(item.nextFollowUpDate) < today);
  const completed = filteredFollowUps.filter((item) => item.status === "Completed");

  const openModal = (type: ModalMode, item: FollowUpItem) => {
    setModalState({ type, item });
    setDraftNotes(item.notes);
    setDraftDate(item.nextFollowUpDate);
  };

  const closeModal = () => {
    setModalState(null);
    setDraftNotes("");
    setDraftDate("");
  };

  const handleMarkCompleted = (id: number) => {
    setFollowUps((current) => current.map((item) => (item.id === id ? { ...item, status: "Completed" } : item)));
  };

  const handleSaveNotes = () => {
    if (!modalState || modalState.type !== "notes") return;
    setFollowUps((current) =>
      current.map((item) => (item.id === modalState.item.id ? { ...item, notes: draftNotes } : item))
    );
    closeModal();
  };

  const handleReschedule = () => {
    if (!modalState || modalState.type !== "reschedule") return;
    setFollowUps((current) =>
      current.map((item) => (item.id === modalState.item.id ? { ...item, nextFollowUpDate: draftDate } : item))
    );
    closeModal();
  };

  return (
    <PageShell
      title="Follow-ups"
      description="Keep your follow-up cadence efficient and your contacts moving forward."
    >
      <div className="space-y-6">
        <Panel title="Follow-up dashboard" description="A calm view of today’s commitments and what needs attention.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Due Today</p>
              <p className="mt-3 text-4xl font-semibold">{dueTodayCount}</p>
              <p className="mt-2 text-sm text-slate-300">Prospects that need action before the day ends.</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Overdue</p>
              <p className="mt-3 text-4xl font-semibold text-slate-950">{overdueCount}</p>
              <p className="mt-2 text-sm text-slate-600">Priority contacts that need a fresh push.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Follow-up workspace" description="Search and filter your pipeline without losing the executive feel.">
          <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Search by prospect name
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search for a prospect"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Filter by time
              <select
                value={activeFilter}
                onChange={(event) => setActiveFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              >
                {filterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Follow-ups Due Today" description="The highest-priority actions for today.">
            <div className="space-y-3">
              {dueToday.length ? (
                dueToday.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    onComplete={() => handleMarkCompleted(item.id)}
                    onReschedule={() => openModal("reschedule", item)}
                    onEditNotes={() => openModal("notes", item)}
                    onOpenProfile={() => openModal("profile", item)}
                  />
                ))
              ) : (
                <p className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  No follow-ups due today for the current search and filter.
                </p>
              )}
            </div>
          </Panel>

          <Panel title="Upcoming Follow-ups" description="The next wave of conversations and check-ins.">
            <div className="space-y-3">
              {upcoming.length ? (
                upcoming.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    onComplete={() => handleMarkCompleted(item.id)}
                    onReschedule={() => openModal("reschedule", item)}
                    onEditNotes={() => openModal("notes", item)}
                    onOpenProfile={() => openModal("profile", item)}
                  />
                ))
              ) : (
                <p className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  There are no upcoming follow-ups matching this filter.
                </p>
              )}
            </div>
          </Panel>

          <Panel title="Overdue Follow-ups" description="Contacts that need a fresh push today.">
            <div className="space-y-3">
              {overdue.length ? (
                overdue.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    onComplete={() => handleMarkCompleted(item.id)}
                    onReschedule={() => openModal("reschedule", item)}
                    onEditNotes={() => openModal("notes", item)}
                    onOpenProfile={() => openModal("profile", item)}
                  />
                ))
              ) : (
                <p className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  No overdue follow-ups right now.
                </p>
              )}
            </div>
          </Panel>

          <Panel title="Completed Follow-ups" description="A clean view of everything you’ve already wrapped up.">
            <div className="space-y-3">
              {completed.length ? (
                completed.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    onComplete={() => handleMarkCompleted(item.id)}
                    onReschedule={() => openModal("reschedule", item)}
                    onEditNotes={() => openModal("notes", item)}
                    onOpenProfile={() => openModal("profile", item)}
                  />
                ))
              ) : (
                <p className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  No completed follow-ups yet.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {modalState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-6">
            {modalState.type === "profile" ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Prospect Profile</p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">{modalState.item.prospectName}</h3>
                  </div>
                  <button onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100">
                    ✕
                  </button>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="mt-1 font-semibold text-slate-950">{modalState.item.status}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Interest Level</p>
                    <p className="mt-1 font-semibold text-slate-950">{modalState.item.interestLevel}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Next Follow-up Date</p>
                    <p className="mt-1 font-semibold text-slate-950">{modalState.item.nextFollowUpDate}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Last Contact Date</p>
                    <p className="mt-1 font-semibold text-slate-950">{modalState.item.lastContactDate}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-sm text-slate-500">Notes</p>
                    <p className="mt-1 font-semibold leading-7 text-slate-950">{modalState.item.notes}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Follow-up Actions</p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                      {modalState.type === "notes" ? "Edit Notes" : "Reschedule Follow-up"}
                    </h3>
                  </div>
                  <button onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100">
                    ✕
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {modalState.type === "notes" ? (
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      Notes
                      <textarea
                        value={draftNotes}
                        onChange={(event) => setDraftNotes(event.target.value)}
                        rows={6}
                        className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                      />
                    </label>
                  ) : (
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      Next Follow-up Date
                      <input
                        type="date"
                        value={draftDate}
                        onChange={(event) => setDraftDate(event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                      />
                    </label>
                  )}
                  <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
                    <button onClick={closeModal} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      Cancel
                    </button>
                    <button
                      onClick={modalState.type === "notes" ? handleSaveNotes : handleReschedule}
                      className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      {modalState.type === "notes" ? "Save Notes" : "Save Date"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

type FollowUpCardProps = {
  item: FollowUpItem;
  onComplete: () => void;
  onReschedule: () => void;
  onEditNotes: () => void;
  onOpenProfile: () => void;
};

function FollowUpCard({ item, onComplete, onReschedule, onEditNotes, onOpenProfile }: FollowUpCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-950">{item.prospectName}</p>
          <p className="mt-1 text-sm text-slate-500">{item.status}</p>
        </div>
        <Badge label={item.interestLevel} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.25rem] bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next Follow-up Date</p>
          <p className="mt-1 font-semibold text-slate-950">{item.nextFollowUpDate}</p>
        </div>
        <div className="rounded-[1.25rem] bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last Contact Date</p>
          <p className="mt-1 font-semibold text-slate-950">{item.lastContactDate}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Notes</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{item.notes}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onComplete} className="rounded-full bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          Mark as Completed
        </button>
        <button onClick={onReschedule} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Reschedule
        </button>
        <button onClick={onEditNotes} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Edit Notes
        </button>
        <button onClick={onOpenProfile} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Open Profile
        </button>
      </div>
    </div>
  );
}
