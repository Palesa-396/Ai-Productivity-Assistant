import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { RecentWork } from "@/components/RecentWork";
import { Field, ToolWorkbench, inputClass } from "@/components/ToolWorkbench";
import { useRequireAuth } from "@/hooks/useAuth";
import { summarizeNotes } from "@/lib/assistant.functions";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Fieldnote" },
      {
        name: "description",
        content:
          "Turn long meeting notes into a concise summary with key points, decisions, action items, owners and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Fieldnote" },
      {
        property: "og:description",
        content: "Key points, decisions, owners and deadlines pulled out of long notes.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { user, loading } = useRequireAuth();
  const [notes, setNotes] = useState("");

  if (loading || !user) return null;

  return (
    <AppShell>
      <ToolWorkbench
        kind="notes"
        step="Tool · 02"
        title="Meeting Notes Summarizer"
        badge="Summarizing"
        runLabel="Summarize notes"
        emptyHint="Paste your raw notes — you'll get key points, decisions, owners and deadlines."
        buildTitle={() => `Summary: ${notes.slice(0, 60)}`}
        buildInput={() => notes}
        run={async () => {
          const result = await summarizeNotes({ data: { notes } });
          return result.text;
        }}
        side={<RecentWork kind="notes" />}
        controls={
          <Field label="Meeting notes">
            <textarea
              rows={14}
              className={`${inputClass} resize-none`}
              placeholder="Paste the full notes or transcript here…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        }
      />
    </AppShell>
  );
}
