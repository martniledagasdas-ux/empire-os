"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../../app/components/page-shell";
import { ProspectModal, type ProspectFormValues } from "../../app/components/prospect-modal";
import { Panel, Badge } from "../../app/components/ui";
import {
  createProspectInSupabase,
  deleteProspectFromSupabase,
  fetchProspectsFromSupabase,
  type ProspectRecord,
  updateProspectInSupabase,
} from "../../lib/supabase/prospects";

const interestOptions = ["All", "Low", "Medium", "High"];
const statusOptions = [
  "All",
  "New",
  "Contacted",
  "Presentation Sent",
  "Follow-up Needed",
  "Enrolled",
  "Not Interested",
];

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<ProspectRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [interestFilter, setInterestFilter] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeProspect, setActiveProspect] = useState<ProspectRecord | null>(null);
  const [editingProspectId, setEditingProspectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProspects = useMemo(() => {
    return prospects.filter((prospect) => {
      const matchesSearch = [prospect.fullName, prospect.country, prospect.email, prospect.status]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || prospect.status === statusFilter;
      const matchesInterest = interestFilter === "All" || prospect.interestLevel === interestFilter;

      return matchesSearch && matchesStatus && matchesInterest;
    });
  }, [interestFilter, prospects, searchTerm, statusFilter]);

  useEffect(() => {
    void loadProspects();
  }, []);

  async function loadProspects() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const data = await fetchProspectsFromSupabase();
      setProspects(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load prospects.");
    } finally {
      setIsLoading(false);
    }
  }

  const openAddModal = () => {
    setEditingProspectId(null);
    setActiveProspect(null);
    setIsFormOpen(true);
  };

  const openEditModal = (prospect: ProspectRecord) => {
    setEditingProspectId(prospect.id);
    setActiveProspect(prospect);
    setIsFormOpen(true);
  };

  const openDetails = (prospect: ProspectRecord) => {
    setActiveProspect(prospect);
    setIsDetailsOpen(true);
  };

  const closeModals = () => {
    setIsFormOpen(false);
    setIsDetailsOpen(false);
    setActiveProspect(null);
    setEditingProspectId(null);
  };

  const handleSaveProspect = async (values: ProspectFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      if (editingProspectId) {
        const updated = await updateProspectInSupabase(editingProspectId, values);
        setProspects((current) => current.map((prospect) => (prospect.id === updated.id ? updated : prospect)));
      } else {
        const created = await createProspectInSupabase(values);
        setProspects((current) => [created, ...current]);
      }
      closeModals();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save prospect.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProspect = async (id: number) => {
    try {
      setErrorMessage("");
      await deleteProspectFromSupabase(id);
      setProspects((current) => current.filter((prospect) => prospect.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete prospect.");
    }
  };

  return (
    <PageShell
      title="Prospects"
      description="Manage incoming interest, qualification stages, and next steps with clarity."
    >
      <div className="space-y-6">
        <Panel title="Prospect command center" description="Search, filter, and manage every lead from one polished workspace.">
          <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Search prospects
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, country, or email"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Filter by Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Filter by Interest
              <select
                value={interestFilter}
                onChange={(event) => setInterestFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              >
                {interestOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={openAddModal}
              className="self-end rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add Prospect
            </button>
          </div>
        </Panel>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Prospects</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{prospects.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">High Interest</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {prospects.filter((item) => item.interestLevel === "High").length}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Follow-up Needed</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {prospects.filter((item) => item.status === "Follow-up Needed").length}
            </p>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <Panel title="Prospects list" description="A curated view of current opportunities and conversations.">
          {isLoading ? (
            <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Loading prospects from Supabase...
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[1.5rem] border border-slate-200/80 md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-500">Country</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-500">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-500">Interest</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-500">Follow-up</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredProspects.map((prospect) => (
                  <tr key={prospect.id} className="align-top">
                    <td className="px-4 py-4 font-semibold text-slate-950">{prospect.fullName}</td>
                    <td className="px-4 py-4">{prospect.country}</td>
                    <td className="px-4 py-4">
                      <p className="text-slate-950">{prospect.email}</p>
                      <p className="text-slate-500">{prospect.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge label={prospect.interestLevel} />
                    </td>
                    <td className="px-4 py-4">
                      <Badge label={prospect.status} />
                    </td>
                    <td className="px-4 py-4">{prospect.nextFollowUpDate || "—"}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openDetails(prospect)} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                          View
                        </button>
                        <button onClick={() => openEditModal(prospect)} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteProspect(prospect.id)} className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

              <div className="space-y-3 md:hidden">
                {filteredProspects.map((prospect) => (
                  <div key={prospect.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{prospect.fullName}</p>
                        <p className="mt-1 text-sm text-slate-600">{prospect.country}</p>
                      </div>
                      <Badge label={prospect.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{prospect.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge label={prospect.interestLevel} />
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {prospect.nextFollowUpDate || "No date"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => openDetails(prospect)} className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                        View
                      </button>
                      <button onClick={() => openEditModal(prospect)} className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteProspect(prospect.id)} className="flex-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      <ProspectModal
        isOpen={isFormOpen}
        onClose={closeModals}
        onSave={handleSaveProspect}
        initialValues={activeProspect ?? undefined}
        title={editingProspectId ? "Edit prospect" : "Add prospect"}
        submitLabel={editingProspectId ? "Update Prospect" : "Save Prospect"}
      />

      {isDetailsOpen && activeProspect ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">Prospect Details</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">{activeProspect.fullName}</h3>
              </div>
              <button
                type="button"
                onClick={closeModals}
                className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Country</p>
                <p className="mt-1 font-semibold text-slate-950">{activeProspect.country || "—"}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Phone / Messenger</p>
                <p className="mt-1 font-semibold text-slate-950">{activeProspect.phone || "—"}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 font-semibold text-slate-950">{activeProspect.email || "—"}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Facebook Profile</p>
                <p className="mt-1 font-semibold text-slate-950">{activeProspect.facebookProfile || "—"}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Interest Level</p>
                <p className="mt-1 font-semibold text-slate-950">{activeProspect.interestLevel}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-1 font-semibold text-slate-950">{activeProspect.status}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-sm text-slate-500">Notes</p>
                <p className="mt-1 font-semibold leading-7 text-slate-950">{activeProspect.notes || "No notes yet."}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-sm text-slate-500">Next Follow-up Date</p>
                <p className="mt-1 font-semibold text-slate-950">{activeProspect.nextFollowUpDate || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
