import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { errorResult, resolvePatientId, textResult } from "../shared";

export default defineTool({
  name: "list_daily_tasks",
  title: "List daily tasks",
  description: "List a patient's care tasks for a given date (defaults to today and the signed-in user).",
  inputSchema: {
    patient_id: z.string().uuid().optional().describe("Patient user id. Omit to use the signed-in user."),
    task_date: z.string().optional().describe("Date in YYYY-MM-DD form. Omit for today."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ patient_id, task_date }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const date = task_date?.trim() || new Date().toISOString().slice(0, 10);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("daily_tasks")
      .select("id,title,description,category,scheduled_time,is_completed,completed_at,task_date")
      .eq("patient_id", resolvePatientId(ctx, patient_id))
      .eq("task_date", date)
      .order("scheduled_time", { ascending: true });
    return error ? errorResult(error.message) : textResult({ task_date: date, tasks: data ?? [] });
  },
});
