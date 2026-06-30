import { PageShell } from "../components/page-shell";
import { Panel, Table, Badge, ActionButton } from "../components/ui";
import { contentItems } from "../../lib/mock-data";

export default function ContentLibraryPage() {
  return (
    <PageShell
      title="Content Library"
      description="Organize your best assets with a refined, corporate-ready content center."
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Panel title="Content catalog" description="Browse core decks, guides, and campaign tools.">
            <Table
              headers={["Title", "Category", "Updated", "Status"]}
              rows={contentItems.map((item) => (
                <tr key={item.title} className="border-b border-slate-200 last:border-0">
                  <td className="px-4 py-4 font-medium text-slate-900">{item.title}</td>
                  <td className="px-4 py-4 text-slate-700">{item.category}</td>
                  <td className="px-4 py-4 text-slate-500">{item.updated}</td>
                  <td className="px-4 py-4 text-slate-700"><Badge label={item.status} /></td>
                </tr>
              ))}
            />
          </Panel>

          <Panel title="Library actions" description="Quick access to add new asset drafts or share materials.">
            <div className="grid gap-3 sm:grid-cols-2">
              <ActionButton label="Upload asset" />
              <ActionButton label="Share collection" />
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Editorial notes" description="Keep content aligned with the Empire System brand and cadence.">
            <div className="space-y-3 text-sm text-slate-600">
              <p>Maintain premium messaging across every prospect touchpoint, training asset, and campaign.</p>
              <p>Use consistent colors, language, and templates to preserve a corporate team identity.</p>
            </div>
          </Panel>

          <Panel title="Status summary" description="Where your content library stands today.">
            <div className="grid gap-3">
              <div className="rounded-3xl bg-slate-950 p-4 text-white">
                <p className="text-sm text-slate-300">Ready for distribution</p>
                <p className="mt-3 text-2xl font-semibold">12 items</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Drafts in review</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">3 items</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}
