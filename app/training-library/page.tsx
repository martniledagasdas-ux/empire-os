"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PageShell } from "../components/page-shell";
import { Panel, Badge } from "../components/ui";
import {
  createTrainingInSupabase,
  deleteTrainingFromSupabase,
  fetchTrainingsFromSupabase,
  type TrainingFormValues,
  type TrainingRecord,
  updateTrainingInSupabase,
} from "../../lib/supabase/trainings";

type TrainingFormState = {
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  resourceUrl: string;
  durationMinutes: number;
  isPublished: boolean;
};

const emptyForm = (): TrainingFormState => ({
  title: "",
  description: "",
  category: "Leadership",
  videoUrl: "",
  resourceUrl: "",
  durationMinutes: 20,
  isPublished: true,
});

export default function TrainingLibraryPage() {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [form, setForm] = useState<TrainingFormState>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadTrainings();
  }, []);

  async function loadTrainings() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const data = await fetchTrainingsFromSupabase();
      setTrainings(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load trainings.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setErrorMessage("Please enter a training title.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const payload: TrainingFormValues = {
        title: form.title,
        description: form.description,
        category: form.category,
        videoUrl: form.videoUrl,
        resourceUrl: form.resourceUrl,
        durationMinutes: form.durationMinutes,
        isPublished: form.isPublished,
      };

      if (editingId !== null) {
        const updated = await updateTrainingInSupabase(editingId, payload);
        setTrainings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createTrainingInSupabase(payload);
        setTrainings((current) => [created, ...current]);
      }

      setForm(emptyForm());
      setEditingId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save the training.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      setErrorMessage("");
      await deleteTrainingFromSupabase(id);
      setTrainings((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete the training.");
    }
  }

  function startEdit(training: TrainingRecord) {
    setEditingId(training.id);
    setForm({
      title: training.title,
      description: training.description,
      category: training.category,
      videoUrl: training.video_url,
      resourceUrl: training.resource_url,
      durationMinutes: training.duration_minutes,
      isPublished: training.is_published,
    });
  }

  const categories = useMemo(() => ["All", ...Array.from(new Set(trainings.map((item) => item.category)))], [trainings]);
  const filteredTrainings = selectedCategory === "All"
    ? trainings
    : trainings.filter((item) => item.category === selectedCategory);

  return (
    <PageShell
      title="Training Library"
      description="A polished learning hub for team development and system mastery."
    >
      <div className="space-y-5">
        <Panel title="Learning roadmap" description="Organize training pathways for fast onboarding and retention.">
          <div className="grid gap-4 sm:grid-cols-3">
            {categories.filter((item) => item !== "All").length ? categories.filter((item) => item !== "All").map((item) => (
              <div key={item} className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-300">{item}</p>
                <p className="mt-4 text-3xl font-semibold">{trainings.filter((training) => training.category === item).length}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">modules available</p>
              </div>
            )) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 sm:col-span-3">
                No training categories yet.
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Featured courses" description="Use these training cards to help your team learn faster.">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-slate-700">
              Filter by category
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="ml-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Loading trainings from Supabase...
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTrainings.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{item.description || "No description provided."}</p>
                    </div>
                    <Badge label={item.category} />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Video URL</p>
                      <p className="mt-1 break-all">{item.video_url || "—"}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Resource URL</p>
                      <p className="mt-1 break-all">{item.resource_url || "—"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
                    <span>{item.duration_minutes} min</span>
                    <span>{item.is_published ? "Published" : "Draft"}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item.id)}
                      className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Training controls" description="Create and update training modules for your team.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Title
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  placeholder="Training title"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Category
                <input
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  placeholder="Leadership"
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="Describe the training"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Video URL
                <input
                  value={form.videoUrl}
                  onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  placeholder="https://"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Resource URL
                <input
                  value={form.resourceUrl}
                  onChange={(event) => setForm((current) => ({ ...current, resourceUrl: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  placeholder="https://"
                />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Duration Minutes
                <input
                  type="number"
                  min="1"
                  value={form.durationMinutes}
                  onChange={(event) => setForm((current) => ({ ...current, durationMinutes: Number(event.target.value) }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))}
                />
                Published
              </label>
            </div>
            {errorMessage ? (
              <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : editingId ? "Save Training" : "Add Training"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm());
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </Panel>
      </div>
    </PageShell>
  );
}
