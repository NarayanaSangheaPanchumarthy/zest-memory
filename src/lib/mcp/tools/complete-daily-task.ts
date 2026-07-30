import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { errorResult, textResult } from "../shared";

export default defineTool({
  name: "complete_daily_task",
  title: "Complete daily task",
  description: "Mark one of the patient's daily care tasks as completed.",
  inputSchema: {
    task_id: z.string().uuid().describe("Id of the daily task to mark completed."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ task_id }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("daily_tasks")
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq("id", task_id)
      .select("id,title,is_completed,completed_at");
    if (error) return errorResult(error.message);
    if (!data?.length) return errorResult("Task not found or not accessible.");
    return textResult({ task: data[0] });
  },
});
