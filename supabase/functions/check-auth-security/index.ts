import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface GotrueSettings {
  disable_signup?: boolean;
  mailer_autoconfirm?: boolean;
  external?: Record<string, boolean>;
  external_anonymous_users_enabled?: boolean;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // AuthN: verify caller and clinician role
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json(401, { error: "Missing auth" });

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json(401, { error: "Invalid auth" });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow, error: roleErr } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "clinician")
      .maybeSingle();
    if (roleErr || !roleRow) return json(403, { error: "Clinician role required" });

    // 1) Public GoTrue settings
    const settingsRes = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    const settings: GotrueSettings = settingsRes.ok ? await settingsRes.json() : {};

    // 2) Live HIBP probe — attempt signup with a known pwned password.
    //    GoTrue rejects with weak_password / pwned error BEFORE creating the user
    //    when HIBP is enabled.
    const probeEmail = `hibp-probe-${crypto.randomUUID()}@example.invalid`;
    const probePassword = "password";
    const probeRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: probeEmail, password: probePassword }),
    });
    const probeBody = await probeRes.json().catch(() => ({}));
    const probeText = JSON.stringify(probeBody).toLowerCase();
    const hibpEnabled =
      probeRes.status === 422 &&
      (probeText.includes("pwned") ||
        probeBody?.error_code === "weak_password" ||
        probeBody?.code === "weak_password");

    // Cleanup: if a user was somehow created, remove it.
    if (probeRes.ok && probeBody?.user?.id) {
      await admin.auth.admin.deleteUser(probeBody.user.id);
    }

    return json(200, {
      checked_at: new Date().toISOString(),
      hibp: {
        enabled: hibpEnabled,
        probe_status: probeRes.status,
        probe_error_code: probeBody?.error_code ?? probeBody?.code ?? null,
        probe_message: probeBody?.msg ?? probeBody?.message ?? null,
      },
      auth_settings: {
        disable_signup: settings.disable_signup ?? null,
        email_confirmation_required:
          settings.mailer_autoconfirm === undefined ? null : !settings.mailer_autoconfirm,
        external_anonymous_users_enabled:
          settings.external_anonymous_users_enabled ?? null,
        providers: settings.external ?? {},
      },
    });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
});
