import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, patientId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch patient data for analysis
    const [vitalsRes, gamesRes, alertsRes, moodsRes, medsRes] = await Promise.all([
      supabase.from("patient_vitals").select("*").eq("patient_id", patientId).order("recorded_at", { ascending: false }).limit(20),
      supabase.from("game_sessions").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(30),
      supabase.from("emergency_alerts").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(10),
      supabase.from("mood_entries").select("*").eq("patient_id", patientId).order("entry_date", { ascending: false }).limit(14),
      supabase.from("medications").select("*").eq("patient_id", patientId).eq("is_active", true),
    ]);

    const profileRes = await supabase.from("profiles").select("full_name").eq("user_id", patientId).maybeSingle();

    const patientContext = {
      name: profileRes.data?.full_name || "Unknown",
      vitals: vitalsRes.data || [],
      cognitiveScores: (gamesRes.data || []).map((g: any) => ({ accuracy: g.accuracy, date: g.created_at, type: g.game_type })),
      alerts: alertsRes.data || [],
      moods: moodsRes.data || [],
      medications: medsRes.data || [],
    };

    let systemPrompt = "";
    if (type === "risk_assessment") {
      systemPrompt = `You are a clinical AI assistant for Alzheimer's care. Analyze the following patient data and provide a comprehensive risk assessment.
      
Include:
1. **Overall Risk Level** (Low/Moderate/High/Critical)
2. **Cognitive Trend Analysis** - analyze game scores over time
3. **Vital Signs Assessment** - flag any concerning patterns
4. **Behavioral Indicators** - mood patterns, symptoms
5. **Recommendations** - specific actionable care adjustments

Be clinical and precise. Use medical terminology appropriately. Format with clear headers.`;
    } else if (type === "treatment_suggestions") {
      systemPrompt = `You are a clinical AI assistant. Based on the patient data, suggest evidence-based care adjustments.
      
Include:
1. **Current Medication Review** - interactions, timing optimization
2. **Cognitive Stimulation Recommendations** - based on game performance trends
3. **Activity Adjustments** - based on vitals and mood data
4. **Monitoring Priorities** - what to watch closely
5. **Caregiver Guidelines** - practical care tips

Be specific and actionable. Reference the patient's actual data.`;
    } else if (type === "report") {
      systemPrompt = `You are a clinical AI assistant. Generate a comprehensive clinical progress report for this Alzheimer's patient.
      
Format as a professional clinical report including:
1. **Patient Summary**
2. **Vitals Overview** (last 20 readings summary)
3. **Cognitive Assessment** (game performance trends)
4. **Mood & Behavioral Analysis**
5. **Current Medications**
6. **Alert History**
7. **Clinical Recommendations**

Use professional clinical language. Include specific numbers and dates.`;
    } else if (type === "cognitive_prediction") {
      systemPrompt = `You are a clinical AI assistant specializing in cognitive decline prediction. Analyze the cognitive game performance data to predict trajectory.
      
Include:
1. **Current Cognitive Status** - based on recent scores
2. **Trend Analysis** - improving, stable, or declining
3. **Rate of Change** - how quickly scores are changing
4. **Predictive Assessment** - expected trajectory over next 3-6 months
5. **Intervention Recommendations** - to slow decline
6. **Comparison Benchmarks** - how this compares to typical Alzheimer's progression

Be data-driven and reference specific score values and dates.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Patient Data:\n${JSON.stringify(patientContext, null, 2)}` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("clinical-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
