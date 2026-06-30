import { PageShell } from "../components/page-shell";
import { Panel, Badge, ActionButton } from "../components/ui";
import { trainings } from "../../lib/mock-data";

export default function TrainingLibraryPage() {
  return (
    <PageShell
      title="Training Library"
      description="A polished learning hub for team development and system mastery."
    >
      <div className="space-y-5">
        <Panel title="Learning roadmap" description="Organize training pathways for fast onboarding and retention.">
          <div className="grid gap-4 sm:grid-cols-3">
            {['Leadership', 'Sales Enablement', 'Team Growth'].map((item) => (
              <div key={item} className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-300">{item}</p>
                <p className="mt-4 text-3xl font-semibold">{Math.floor(Math.random() * 40) + 12}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">modules available</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Featured courses" description="Use these training cards to help your team learn faster.">
          <div className="grid gap-4">
            {trainings.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <Badge label={item.category} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-600">
                  <span>{item.duration}</span>
                  <span>{item.progress}% complete</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[calc(var(--progress)/1%)] rounded-full bg-slate-950" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Support assets" description="Bring the training experience into meetings and coaching sessions.">
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionButton label="Download workbook" />
            <ActionButton label="Assign program" />
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
