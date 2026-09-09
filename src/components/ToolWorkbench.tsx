import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Markdown } from "@/components/Markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  kind: string;
  step: string;
  title: string;
  badge: string;
  runLabel: string;
  controls: ReactNode;
  emptyHint: string;
  buildTitle: () => string;
  buildInput: () => string;
  run: () => Promise<string>;
  side?: ReactNode;
};

export function ToolWorkbench({
  kind,
  step,
  title,
  badge,
  runLabel,
  controls,
  emptyHint,
  buildTitle,
  buildInput,
  run,
  side,
}: Props) {
  const { user } = useAuth();
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleRun() {
    setBusy(true);
    setOutput("");
    try {
      const text = await run();
      setOutput(text);
      if (user) {
        const { error } = await supabase.from("work_items").insert({
          user_id: user.id,
          kind,
          title: buildTitle().slice(0, 120) || title,
          input: buildInput(),
          output: text,
        });
        if (error) toast.error("Saved to screen, but not to your account.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error && error.message.includes("Unauthorized")
          ? "Please sign in again."
          : "That didn't work. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-5">
      <div className="rise rounded-3xl glass p-5 lg:col-span-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {step}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>
          <span className="rounded-full bg-mint/70 px-3 py-1 text-xs font-medium text-ink">
            {badge}
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            {controls}
            <button
              onClick={handleRun}
              disabled={busy}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {busy ? "Working…" : runLabel}
            </button>
          </div>

          <div className="rounded-2xl bg-background/70 p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Result
              </span>
              {output && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    toast.success("Copied");
                  }}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Copy
                </button>
              )}
            </div>
            <div className="mt-3">
              {busy && (
                <p className="text-sm text-muted-foreground">
                  Thinking it through…
                </p>
              )}
              {!busy && !output && (
                <p className="text-sm text-muted-foreground">{emptyHint}</p>
              )}
              {!busy && output && <Markdown>{output}</Markdown>}
            </div>
          </div>
        </div>
      </div>

      <div className="rise lg:col-span-2">{side}</div>
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function ChoiceRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={
            option === value
              ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              : "rounded-lg bg-white/60 px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-black/5"
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl bg-white/60 px-3 py-2 text-sm text-foreground ring-1 ring-black/5 outline-none placeholder:text-muted-foreground/70";
