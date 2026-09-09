import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import logo from "@/assets/fieldnote-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/", label: "Workspace" },
  { to: "/email", label: "Email" },
  { to: "/notes", label: "Notes" },
  { to: "/planner", label: "Planner" },
  { to: "/research", label: "Research" },
  { to: "/chat", label: "Chat" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute -top-32 -right-24 size-[460px] rounded-full bg-mint/60 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -left-32 size-[420px] rounded-full bg-peach/60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 size-[380px] rounded-full bg-sky/50 blur-3xl" />

        <header className="relative z-10 border-b border-white/50 glass">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logo}
                alt="Fieldnote"
                width={32}
                height={32}
                className="size-8 rounded-xl"
              />
              <span className="font-display text-lg font-semibold tracking-tight">
                Fieldnote
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/auth" });
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign out
              </button>
              <div className="grid size-9 place-items-center rounded-full bg-lilac text-sm font-semibold text-ink">
                {initials}
              </div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
