import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMedicationsTool from "./tools/list-medications";
import listDailyTasksTool from "./tools/list-daily-tasks";
import completeDailyTaskTool from "./tools/complete-daily-task";
import logMoodEntryTool from "./tools/log-mood-entry";
import listRecentVitalsTool from "./tools/list-recent-vitals";
import listAppointmentsTool from "./tools/list-appointments";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "memory-compass",
  title: "Memory Compass",
  version: "0.1.0",
  instructions:
    "Tools for Memory Compass, an Alzheimer's care platform. Read medications, daily care tasks, vitals and appointments for the signed-in patient (or an assigned patient), mark tasks complete, and log mood diary entries. All access is scoped by the app's row-level security, so only data the signed-in user may see is returned.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listMedicationsTool,
    listDailyTasksTool,
    completeDailyTaskTool,
    logMoodEntryTool,
    listRecentVitalsTool,
    listAppointmentsTool,
  ],
});
