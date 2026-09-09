import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { RecentWork } from "@/components/RecentWork";
import { useRequireAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fieldnote — AI assistant for everyday work" },
      {
        name: "description",
        content:
          "Fieldnote helps employees write emails, summarize meeting notes, plan the week and understand research — all in one calm workspace.",
      },
      { property: "og:title", content: "Fieldnote — AI assistant for everyday work" },
      {
        property: "og:description",
        content:
          "Write emails, summarize meetings, plan your week and simplify research with one AI workplace assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const TOOLS = [
  {
    to: "/email",
    tint: "bg-peach",
    name: "Email Generator",
    blurb: "Draft context-aware notes with tone and audience controls.",
  },
  {
    to: "/notes",
    tint: "bg-mint",
    name: "Notes Summarizer",
    blurb: "Turn long notes into key points, decisions and owners.",
  },
  {
    to: "/planner",
    tint: "bg-sky",
    name: "Task Planner",
    blurb: "Prioritize the day by urgency and importance.",
  },
  {
    to: "/research",
    tint: "bg-butter",
    name: "Research Assistant",
    blurb: "Summarize reports into quick-reading insights.",
  },
  {
    to: "/chat",
    tint: "bg-lilac",
    name: "Chat Assistant",
    blurb: "Ask anything, the way you'd ask a colleague.",
  },
] as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Home() {
  const { user, loading } = useRequireAuth();
  if (loading || !user) return null;

  const name =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "there";

  return (
    <AppShell>
      <p className="text-sm font-medium text-muted-foreground">
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>
      <h1 className="mt-1 max-w-[30ch] font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
        {greeting()}, {name}. Your day is ready to plan.
      </h1>
      <p className="mt-3 max-w-[48ch] text-pretty text-base text-muted-foreground">
        Here's what's waiting on your desk. Pick a tool to make it a little
        lighter.
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Your tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="rise rounded-2xl glass p-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className={`size-10 rounded-xl ${tool.tint}`} />
              <p className="mt-3 text-sm font-semibold">{tool.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {tool.blurb}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <RecentWork />
        <div className="rounded-3xl glass p-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            How to get the most out of Fieldnote
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              Paste raw meeting notes — the summarizer pulls out decisions,
              owners and deadlines for you.
            </li>
            <li>
              Tell the planner your real hours; it schedules around them instead
              of an ideal day.
            </li>
            <li>
              Ask the chat assistant follow-up questions — it remembers the
              conversation.
            </li>
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
