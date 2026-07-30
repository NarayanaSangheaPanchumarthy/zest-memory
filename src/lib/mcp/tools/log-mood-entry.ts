import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { errorResult, resolvePatientId, textResult } from "../shared";

export default defineTool({
  name: "log_mood_entry",
  title: "Log mood entry",
  description: "Record a mood diary entry for a patient.",
  inputSchema: {
    mood: z.string().trim().min(1).describe("Mood label, e.g. calm, anxious, happy."),
    energy_level: z.number().int().optional().describe("Energy level from 1 (low) to 5 (high)."),
    notes: z.string().optional().describe("Optional free-text notes."),
    symptoms: z.array(z.string()).optional().describe("Optional list of observed symptoms."),
    patient_id: z.string().uuid().optional().describe("Patient user id. Omit to use the signed-in user."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ mood, energy_level, notes, symptoms, patient_id }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("mood_entries")
      .insert({
        patient_id: resolvePatientId(ctx, patient_id),
        mood,
        energy_level: energy_level ?? null,
        notes: notes ?? null,
        symptoms: symptoms ?? null,
      })
      .select("id,mood,energy_level,notes,symptoms,entry_date");
    return error ? errorResult(error.message) : textResult({ entry: data?.[0] });
  },
});
