import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/fieldnote-logo.png";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { inputClass } from "@/components/ToolWorkbench";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Fieldnote — AI workplace assistant" },
      {
        name: "description",
        content:
          "Sign in to Fieldnote to draft emails, summarize meetings, plan your week and research faster with an AI workplace assistant.",
      },
      { property: "og:title", content: "Sign in to Fieldnote" },
      {
        property: "og:description",
        content: "Your AI workplace assistant for emails, notes, plans and research.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/" });
  }, [session, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created. Welcome to Fieldnote.");
        } else {
          toast.success(
            "Almost there — check your inbox and click the confirmation link.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error("Google sign-in didn't work. Please try again.");
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center bg-background px-6 font-sans">
      <div className="pointer-events-none absolute -top-32 -right-24 size-[460px] rounded-full bg-mint/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 size-[420px] rounded-full bg-peach/60 blur-3xl" />

      <div className="rise relative z-10 w-full max-w-md rounded-3xl glass p-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Fieldnote" width={36} height={36} className="size-9" />
          <span className="font-display text-xl font-semibold tracking-tight">
            Fieldnote
          </span>
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Welcome back." : "Make your workday lighter."}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Draft emails, summarize meetings, plan your week and research faster.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "signup" && (
            <input
              className={inputClass}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className={inputClass}
            type="email"
            required
            placeholder="Work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={inputClass}
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={google}
          className="mt-3 w-full rounded-xl bg-white/70 py-2.5 text-sm font-semibold text-foreground ring-1 ring-black/5"
        >
          Continue with Google
        </button>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
