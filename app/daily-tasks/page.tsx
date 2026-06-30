import { PageShell } from "../components/page-shell";
import { Panel, ActionButton, Badge } from "../components/ui";
import { dailyTasks } from "../../lib/mock-data";

export default function DailyTasksPage() {
  return (
    <PageShell
      title="Daily Tasks"
      description="A focused, mobile-friendly workspace for your day’s most important responsibilities."
    >
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <Panel title="Today’s priorities" description="Stay ahead of urgent tasks and team support actions.">
            <div className="space-y-3">
              {dailyTasks.map((item) => (
                <div
                  key={item.task}
                  className={`rounded-[1.5rem] border px-4 py-4 ${item.completed ? "border-slate-200 bg-slate-50" : "border-slate-300 bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{item.task}</p>
                      <p className="mt-1 text-sm text-slate-500">Due: {item.due}</p>
                    </div>
                    <Badge label={item.completed ? "Done" : "Open"} variant={item.completed ? "soft" : "solid"} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Task controls" description="Actions to clear work and align with team priorities.">
            <div className="grid gap-3 sm:grid-cols-2">
              <ActionButton label="Mark complete" />
              <ActionButton label="Add a task" />
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Daily summary" description="Quick metrics for your current workflow.">
            <div className="grid gap-3">
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">Tasks completed</p>
                <p className="mt-3 text-3xl font-semibold">{dailyTasks.filter((task) => task.completed).length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-slate-950">
                <p className="text-sm text-slate-500">Tasks remaining</p>
                <p className="mt-3 text-3xl font-semibold">{dailyTasks.filter((task) => !task.completed).length}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Weekly rhythm" description="Use a consistent daily structure to maintain team momentum.">
            <p className="text-sm leading-6 text-slate-600">
              Start with your highest-value follow-ups, then set aside focused time for training, content updates, and progress check-ins.
            </p>
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}
