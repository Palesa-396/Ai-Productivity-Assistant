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
import { generateEmail } from "@/lib/assistant.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Fieldnote" },
      {
        name: "description",
        content:
          "Generate professional emails with the right tone and audience — formal, informal or persuasive, for clients, managers or your team.",
      },
      { property: "og:title", content: "Smart Email Generator — Fieldnote" },
      {
        property: "og:description",
        content: "Context-based professional emails with tone and audience controls.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Informal", "Persuasive"] as const;
const AUDIENCES = ["Client", "Manager", "Team"] as const;

function EmailPage() {
  const { user, loading } = useRequireAuth();
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [audience, setAudience] =
    useState<(typeof AUDIENCES)[number]>("Client");
  const [context, setContext] = useState("");

  if (loading || !user) return null;

  return (
    <AppShell>
      <ToolWorkbench
        kind="email"
        step="Tool · 01"
        title="Smart Email Generator"
        badge="Drafting"
        runLabel="Generate email"
        emptyHint="Add a little context and your email appears here, ready to send."
        buildTitle={() => `Email to ${recipient || audience}: ${context}`}
        buildInput={() => `${tone} · ${audience} · ${recipient}\n${context}`}
        run={async () => {
          const result = await generateEmail({
            data: { recipient, tone, audience, context },
          });
          return result.text;
        }}
        side={<RecentWork kind="email" />}
        controls={
          <>
            <Field label="Recipient">
              <input
                className={inputClass}
                placeholder="Daniel Okafor — Client, Northwind"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </Field>
            <Field label="Tone">
              <ChoiceRow options={TONES} value={tone} onChange={setTone} />
            </Field>
            <Field label="Audience">
              <ChoiceRow
                options={AUDIENCES}
                value={audience}
                onChange={setAudience}
              />
            </Field>
            <Field label="Details">
              <textarea
                rows={5}
                className={`${inputClass} resize-none`}
                placeholder="Confirming Friday's 2pm review and the revised Q3 timeline."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </Field>
          </>
        }
      />
    </AppShell>
  );
}
