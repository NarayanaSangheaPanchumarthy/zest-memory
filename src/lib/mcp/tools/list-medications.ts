import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { errorResult, resolvePatientId, textResult } from "../shared";

export default defineTool({
  name: "list_medications",
  title: "List medications",
  description: "List active medications for a patient (defaults to the signed-in user).",
  inputSchema: {
    patient_id: z.string().uuid().optional().describe("Patient user id. Omit to use the signed-in user."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ patient_id }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("medications")
      .select("id,name,dosage,frequency,time_of_day,notes,is_active")
      .eq("patient_id", resolvePatientId(ctx, patient_id))
      .eq("is_active", true)
      .order("name");
    return error ? errorResult(error.message) : textResult({ medications: data ?? [] });
  },
});
