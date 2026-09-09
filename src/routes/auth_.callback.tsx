import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import logo from "@/assets/fieldnote-logo.png";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth_/callback")({
  head: () => ({
    meta: [
      { title: "Confirm your account — Fieldnote" },
      {
        name: "description",
        content: "Complete your Fieldnote account confirmation.",
      },
      { property: "og:title", content: "Confirm your Fieldnote account" },
      {
        property: "og:description",
        content: "Complete your Fieldnote account confirmation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function finishConfirmation() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const urlError =
        url.searchParams.get("error_description") ??
        new URLSearchParams(url.hash.slice(1)).get("error_description");

      if (urlError) {
        if (active) setError(urlError);
        return;
      }

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active) setError(exchangeError.message);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (active) {
          setError("This confirmation link is invalid or has expired.");
        }
        return;
      }

      await navigate({ to: "/" });
    }

    void finishConfirmation();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 font-sans">
      <div className="glass w-full max-w-md rounded-3xl p-6 text-center">
        <img
          src={logo}
          alt="Fieldnote"
          width={44}
          height={44}
          className="mx-auto size-11"
        />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          {error ? "Confirmation link unavailable" : "Confirming your account…"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ?? "Please wait while Fieldnote signs you in."}
        </p>
        {error && (
          <a
            href="/auth"
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Return to sign in
          </a>
        )}
      </div>
    </main>
  );
}