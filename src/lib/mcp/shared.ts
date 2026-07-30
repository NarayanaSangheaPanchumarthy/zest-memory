import type { ToolContext } from "@lovable.dev/mcp-js";

/** Resolve the patient whose data a tool should act on. Defaults to the caller. */
export function resolvePatientId(ctx: ToolContext, patientId?: string): string {
  const id = patientId?.trim() || ctx.getUserId();
  if (!id) throw new Error("No patient id available for this request");
  return id;
}

export function textResult(payload: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload) }] };
}

export function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}
