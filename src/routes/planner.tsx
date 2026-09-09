import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { RecentWork } from "@/components/RecentWork";
import {
  ChoiceRow,
  Field,
  ToolWorkbench,
  inputClass,
} from "@/components/ToolWorkbench";
import { useRequireAuth } from "@/hooks/useAuth";
import { generatePlan } from "@/lib/assistant.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Fieldnote" },
      {
        name: "description",
        content:
          "Turn a messy task list into a prioritized, time-blocked daily or weekly plan with practical time-saving suggestions.",
      },
      { property: "og:title", content: "AI Task Planner — Fieldnote" },
      {
        property: "og:description",
        content: "Prioritized daily and weekly plans built around your real working hours.",
      },
    ],
  }),
  component: PlannerPage,
});

const HORIZONS = ["Day", "Week"] as const;

function PlannerPage() {
  const { user, loading } = useRequireAuth();
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>("Day");
  const [hours, setHours] = useState("");

  if (loading || !user) return null;

  return (
    <AppShell>
      <ToolWorkbench
        kind="plan"
        step="Tool · 03"
        title="AI Task Planner"
        badge="Planning"
        runLabel="Build my plan"
        emptyHint="List what's on your plate and get a ranked, time-blocked plan."
        buildTitle={() => `${horizon} plan — ${new Date().toLocaleDateString()}`}
        buildInput={() => `${horizon} · ${hours}\n${tasks}`}
        run={async () => {
          const result = await generatePlan({
            data: { tasks, horizon, hours },
          });
          return result.text;
        }}
        side={<RecentWork kind="plan" />}
        controls={
          <>
            <Field label="Plan for">
              <ChoiceRow
                options={HORIZONS}
                value={horizon}
                onChange={setHorizon}
              />
            </Field>
            <Field label="Working hours">
              <input
                className={inputClass}
                placeholder="09:00–17:00, standup at 11:00"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </Field>
            <Field label="Tasks and commitments">
              <textarea
                rows={10}
                className={`${inputClass} resize-none`}
                placeholder="Finish launch deck (due Thursday), review 4 pull requests, reply to Daniel, prep budget numbers…"
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
            </Field>
          </>
        }
      />
    </AppShell>
  );
}
