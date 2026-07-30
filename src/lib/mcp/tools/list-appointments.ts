import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { errorResult, resolvePatientId, textResult } from "../shared";

export default defineTool({
  name: "list_appointments",
  title: "List appointments",
  description: "List upcoming appointments for a patient.",
  inputSchema: {
    patient_id: z.string().uuid().optional().describe("Patient user id. Omit to use the signed-in user."),
    limit: z.number().int().optional().describe("How many appointments to return (1-50, default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ patient_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const take = Math.min(Math.max(limit ?? 10, 1), 50);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", resolvePatientId(ctx, patient_id))
      .order("appointment_date", { ascending: true })
      .limit(take);
    return error ? errorResult(error.message) : textResult({ appointments: data ?? [] });
  },
});
