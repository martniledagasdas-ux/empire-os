"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../components/page-shell";
import { Panel, Badge } from "../components/ui";
import {
  createFollowUpInSupabase,
  deleteFollowUpFromSupabase,
  fetchFollowUpsFromSupabase,
  fetchProspectsForFollowUps,
  type FollowUpRecord,
  updateFollowUpInSupabase,
} from "../../lib/supabase/follow-ups";

type FollowUpItem = {
  id: string;
  prospectName: string;
  status: string;
  interestLevel: "Low" | "Medium" | "High";
  nextFollowUpDate: string;
  notes: string;
  lastContactDate: string;
};

type ModalMode = "notes" | "reschedule" | "profile" | "form";

type ModalState = { type: ModalMode; item?: FollowUpItem } | null;

type ProspectOption = { id: string; fullName: string };

const filterOptions = ["Today", "Tomorrow", "This Week", "Overdue", "Completed"];

function normalizeDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Today");
  const [modalState, setModalState] = useState<ModalState>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [draftStatus, setDraftStatus] = useState("Scheduled");
  const [draftProspectId, setDraftProspectId] = useState("");
  const [prospects, setProspects] = useState<ProspectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  useEffect(() => {
    void loadFollowUps();
  }, []);

  async function loadFollowUps() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const [followUpRows, prospectRows] = await Promise.all([
        fetchFollowUpsFromSupabase(),
        fetchProspectsForFollowUps(),
      ]);
      setProspects(prospectRows);
      setFollowUps(
        followUpRows.map((row) => ({
          id: row.id,
          prospectName: row.prospect_name ?? "Unknown prospect",
          status: row.status,
          interestLevel: "Medium" as const,
          nextFollowUpDate: row.follow_up_date,
          notes: row.notes,
          lastContactDate: row.updated_at ? row.updated_at.split("T")[0] : row.follow_up_date,
        }))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load follow-ups.");
    } finally {
      setIsLoading(false);
    }
  }

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

  const openModal = (type: ModalMode, item?: FollowUpItem) => {
    setModalState({ type, item });
    setDraftNotes(item?.notes ?? "");
    setDraftDate(item?.nextFollowUpDate ?? "");
    setDraftStatus(item?.status ?? "Scheduled");
    setDraftProspectId(item ? prospects.find((prospect) => prospect.fullName === item.prospectName)?.id ?? "" : "");
  };

  const closeModal = () => {
    setModalState(null);
    setDraftNotes("");
    setDraftDate("");
    setDraftStatus("Scheduled");
    setDraftProspectId("");
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      setErrorMessage("");
      const updated = await updateFollowUpInSupabase(id, {
        follow_up_date: followUps.find((item) => item.id === id)?.nextFollowUpDate ?? "",
        status: "Completed",
        notes: followUps.find((item) => item.id === id)?.notes ?? "",
      });
      setFollowUps((current) => current.map((item) => (item.id === updated.id ? { ...item, status: updated.status, nextFollowUpDate: updated.follow_up_date, notes: updated.notes } : item)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update follow-up.");
    }
  };

  const handleSaveNotes = async () => {
    if (!modalState || modalState.type !== "notes" || !modalState.item) return;
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const updated = await updateFollowUpInSupabase(modalState.item.id, {
        follow_up_date: modalState.item.nextFollowUpDate,
        status: modalState.item.status,
        notes: draftNotes,
      });
      setFollowUps((current) => current.map((item) => (item.id === updated.id ? { ...item, notes: updated.notes } : item)));
      closeModal();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update notes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!modalState || modalState.type !== "reschedule" || !modalState.item) return;
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const updated = await updateFollowUpInSupabase(modalState.item.id, {
        follow_up_date: draftDate,
        status: modalState.item.status,
        notes: modalState.item.notes,
      });
      setFollowUps((current) => current.map((item) => (item.id === updated.id ? { ...item, nextFollowUpDate: updated.follow_up_date } : item)));
      closeModal();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to reschedule follow-up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFollowUp = async () => {
    if (!draftProspectId || !draftDate) {
      setErrorMessage("Please select a prospect and a follow-up date.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const created = await createFollowUpInSupabase({
        prospect_id: draftProspectId,
        follow_up_date: draftDate,
        status: draftStatus,
        notes: draftNotes,
      });
      setFollowUps((current) => [
        {
          id: created.id,
          prospectName: created.prospect_name ?? "Unknown prospect",
          status: created.status,
          interestLevel: "Medium" as const,
          nextFollowUpDate: created.follow_up_date,
          notes: created.notes,
          lastContactDate: created.updated_at ? created.updated_at.split("T")[0] : created.follow_up_date,
        },
        ...current,
      ]);
      closeModal();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create follow-up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFollowUp = async (id: string) => {
    try {
      setErrorMessage("");
      await deleteFollowUpFromSupabase(id);
      setFollowUps((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete follow-up.");
    }
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
          <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto]">
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
            <button
              type="button"
              onClick={() => openModal("form")}
              className="self-end rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add Follow-up
            </button>
          </div>
        </Panel>

        {errorMessage ? (
          <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Loading follow-ups from Supabase...
          </div>
        ) : (
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
                    onDelete={() => handleDeleteFollowUp(item.id)}
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
                    onDelete={() => handleDeleteFollowUp(item.id)}
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
                    onDelete={() => handleDeleteFollowUp(item.id)}
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
                    onDelete={() => handleDeleteFollowUp(item.id)}
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
        )}
      </div>

      {modalState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-6">
            {modalState.type === "form" ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-blue-600">New Follow-up</p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">Create a follow-up</h3>
                  </div>
                  <button onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100">
                    ✕
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Prospect
                    <select
                      value={draftProspectId}
                      onChange={(event) => setDraftProspectId(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    >
                      <option value="">Select a prospect</option>
                      {prospects.map((prospect) => (
                        <option key={prospect.id} value={prospect.id}>
                          {prospect.fullName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Follow-up Date
                    <input
                      type="date"
                      value={draftDate}
                      onChange={(event) => setDraftDate(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Status
                    <select
                      value={draftStatus}
                      onChange={(event) => setDraftStatus(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Notes
                    <textarea
                      value={draftNotes}
                      onChange={(event) => setDraftNotes(event.target.value)}
                      rows={5}
                      className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </label>
                  <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
                    <button onClick={closeModal} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      Cancel
                    </button>
                    <button onClick={handleCreateFollowUp} className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                      {isSubmitting ? "Saving..." : "Save Follow-up"}
                    </button>
                  </div>
                </div>
              </>
            ) : modalState.type === "profile" && modalState.item ? (
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
                      {isSubmitting ? "Saving..." : modalState.type === "notes" ? "Save Notes" : "Save Date"}
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
  onDelete: () => void;
};

function FollowUpCard({ item, onComplete, onReschedule, onEditNotes, onOpenProfile, onDelete }: FollowUpCardProps) {
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
        <button onClick={onDelete} className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
          Delete
        </button>
      </div>
    </div>
  );
}
