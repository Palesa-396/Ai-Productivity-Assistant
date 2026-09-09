import { useQuery } from "@tanstack/react-query";

import { Markdown } from "@/components/Markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function RecentWork({ kind }: { kind?: string }) {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["work_items", kind ?? "all", user?.id],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("work_items")
        .select("id,title,kind,output,created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (kind) query = query.eq("kind", kind);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="rounded-3xl glass p-5">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Recently saved
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Everything you generate is kept in your account.
      </p>
      <div className="mt-4 space-y-2">
        {(data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
        )}
        {(data ?? []).map((item) => (
          <details
            key={item.id}
            className="rounded-2xl bg-white/60 p-3 ring-1 ring-black/5"
          >
            <summary className="cursor-pointer text-sm font-medium">
              {item.title}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </summary>
            <div className="mt-3 border-t border-black/5 pt-3">
              <Markdown>{item.output}</Markdown>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
