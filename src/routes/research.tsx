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
import { researchBrief } from "@/lib/assistant.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Fieldnote" },
      {
        name: "description",
        content:
          "Summarize articles, reports and complex topics into plain-English insights, recommendations and watch-outs.",
      },
      { property: "og:title", content: "AI Research Assistant — Fieldnote" },
      {
        property: "og:description",
        content: "Plain-English insights and recommendations from dense reports and topics.",
      },
    ],
  }),
  component: ResearchPage,
});

const DEPTHS = ["Quick brief", "Detailed"] as const;

function ResearchPage() {
  const { user, loading } = useRequireAuth();
  const [source, setSource] = useState("");
  const [depth, setDepth] = useState<(typeof DEPTHS)[number]>("Quick brief");

  if (loading || !user) return null;

  return (
    <AppShell>
      <ToolWorkbench
        kind="research"
        step="Tool · 04"
        title="AI Research Assistant"
        badge="Reading"
        runLabel="Give me the brief"
        emptyHint="Paste an article or name a topic — you'll get it in plain English."
        buildTitle={() => `Brief: ${source.slice(0, 60)}`}
        buildInput={() => `${depth}\n${source}`}
        run={async () => {
          const result = await researchBrief({ data: { source, depth } });
          return result.text;
        }}
        side={<RecentWork kind="research" />}
        controls={
          <>
            <Field label="Depth">
              <ChoiceRow options={DEPTHS} value={depth} onChange={setDepth} />
            </Field>
            <Field label="Topic or text">
              <textarea
                rows={12}
                className={`${inputClass} resize-none`}
                placeholder="Paste an article or report, or type a topic like 'async-first team practices'…"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </Field>
          </>
        }
      />
    </AppShell>
  );
}
