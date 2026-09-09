import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ASSISTANT_MODEL,
  createLovableAiGatewayProvider,
  requireGatewayKey,
} from "./ai-gateway.server";

async function run(system: string, prompt: string) {
  const gateway = createLovableAiGatewayProvider(requireGatewayKey());
  const result = streamText({
    model: gateway(ASSISTANT_MODEL),
    system,
    prompt,
  });
  return await result.text;
}

const EmailInput = z.object({
  context: z.string().min(1),
  tone: z.enum(["Formal", "Informal", "Persuasive"]),
  audience: z.enum(["Client", "Manager", "Team"]),
  recipient: z.string().optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const text = await run(
      "You are a workplace writing assistant. Write complete, ready-to-send professional emails in markdown. Start with a bold Subject line, then the body. Never add commentary before or after the email.",
      `Write an email.
Tone: ${data.tone}
Audience: ${data.audience}
Recipient: ${data.recipient || "the recipient"}
What it should cover: ${data.context}`,
    );
    return { text };
  });

const NotesInput = z.object({ notes: z.string().min(1) });

export const summarizeNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }) => {
    const text = await run(
      "You summarize meeting notes for busy employees. Reply in markdown with these sections in order: '## Summary' (3-4 sentences), '## Key points', '## Decisions', '## Action items' (each line as: owner — task — deadline, writing 'No deadline set' when missing), '## Deadlines'. Be concise and never invent facts.",
      `Summarize these meeting notes:\n\n${data.notes}`,
    );
    return { text };
  });

const PlanInput = z.object({
  tasks: z.string().min(1),
  horizon: z.enum(["Day", "Week"]),
  hours: z.string().optional(),
});

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const text = await run(
      "You are a productivity planner. Reply in markdown with: '## Priorities' (ranked, each labelled Urgent/Important/Later with a one-line reason), '## Schedule' (a time-blocked table with Time and Focus columns), '## Time-saving suggestions' (3 concrete tips). Keep it realistic.",
      `Build a ${data.horizon.toLowerCase()} plan.
Available working hours: ${data.hours || "a standard working day"}
Tasks and commitments:\n${data.tasks}`,
    );
    return { text };
  });

const ResearchInput = z.object({
  source: z.string().min(1),
  depth: z.enum(["Quick brief", "Detailed"]),
});

export const researchBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const text = await run(
      "You are a research assistant for non-specialists. Reply in markdown with: '## In plain English' (short paragraph), '## Key insights' (bullets), '## Recommendations' (bullets), '## Watch-outs' (bullets). Simplify jargon and flag anything uncertain.",
      `${data.depth === "Detailed" ? "Give a thorough brief." : "Give a short, quick-reading brief."}\n\nTopic or text to review:\n\n${data.source}`,
    );
    return { text };
  });
