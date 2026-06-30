"use client";

import { FormEvent, useEffect, useState } from "react";

export type ProspectFormValues = {
  fullName: string;
  country: string;
  phone: string;
  email: string;
  facebookProfile: string;
  interestLevel: string;
  status: string;
  notes: string;
  nextFollowUpDate: string;
};

type ProspectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prospect: ProspectFormValues) => void;
  initialValues?: ProspectFormValues;
  title?: string;
  submitLabel?: string;
};

const emptyForm: ProspectFormValues = {
  fullName: "",
  country: "",
  phone: "",
  email: "",
  facebookProfile: "",
  interestLevel: "Medium",
  status: "New",
  notes: "",
  nextFollowUpDate: "",
};

const interestLevels = ["Low", "Medium", "High"];
const statusOptions = [
  "New",
  "Contacted",
  "Presentation Sent",
  "Follow-up Needed",
  "Enrolled",
  "Not Interested",
];

export function ProspectModal({
  isOpen,
  onClose,
  onSave,
  initialValues,
  title = "New lead details",
  submitLabel = "Save Prospect",
}: ProspectModalProps) {
  const [formValues, setFormValues] = useState<ProspectFormValues>(initialValues ?? emptyForm);

  useEffect(() => {
    if (isOpen) {
      setFormValues(initialValues ?? emptyForm);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field: keyof ProspectFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave(formValues);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-blue-600">Prospect Form</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Full Name
            <input
              required
              value={formValues.fullName}
              onChange={(event) => handleChange("fullName", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="Alicia Gomez"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Country
            <input
              value={formValues.country}
              onChange={(event) => handleChange("country", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="United States"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Phone / Messenger
            <input
              value={formValues.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="+1 555 123 4567"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={formValues.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="alicia@email.com"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Facebook Profile
            <input
              value={formValues.facebookProfile}
              onChange={(event) => handleChange("facebookProfile", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="facebook.com/alicia"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Interest Level
            <select
              value={formValues.interestLevel}
              onChange={(event) => handleChange("interestLevel", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            >
              {interestLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Status
            <select
              value={formValues.status}
              onChange={(event) => handleChange("status", event.target.value)}
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
            Next Follow-up Date
            <input
              type="date"
              value={formValues.nextFollowUpDate}
              onChange={(event) => handleChange("nextFollowUpDate", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
            Notes
            <textarea
              rows={4}
              value={formValues.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
              className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="What matters most to this prospect?"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:col-span-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
