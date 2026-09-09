import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Markdown } from "@/components/Markdown";
import { useRequireAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat Assistant — Fieldnote" },
      {
        name: "description",
        content:
          "Ask Fieldnote anything about your workday: drafts, summaries, plans and research, in one conversation.",
      },
      { property: "og:title", content: "Chat Assistant — Fieldnote" },
      {
        property: "og:description",
        content:
          "An interactive workplace assistant that answers questions and helps you get work done.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function textOf(message: { parts?: Array<{ type: string; text?: string }> }) {
  return (message.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

function ChatPage() {
  const { user, loading } = useRequireAuth();
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onError: () => toast.error("The assistant couldn't reply. Please try again."),
  });

  if (loading || !user) return null;
  const busy = status === "submitted" || status === "streaming";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
  }

  return (
    <AppShell>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Chat assistant
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Ask Fieldnote anything
      </h1>

      <div className="rise mt-6 flex min-h-[52vh] flex-col rounded-3xl glass p-4 sm:p-6">
        <div className="flex-1 space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Try: “Draft a polite nudge about the overdue report” or “Turn these
              notes into action items”.
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-sky/50 px-4 py-3 text-sm"
                    : "max-w-[90%] rounded-2xl bg-card/70 px-4 py-3 text-sm"
                }
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{textOf(message)}</p>
                ) : (
                  <Markdown>{textOf(message)}</Markdown>
                )}
              </div>
            ))
          )}
          {busy ? (
            <p className="text-xs text-muted-foreground">Fieldnote is typing…</p>
          ) : null}
        </div>

        <form onSubmit={submit} className="mt-6 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            placeholder="Type your question…"
            className="min-h-[52px] flex-1 resize-none rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </AppShell>
  );
}
