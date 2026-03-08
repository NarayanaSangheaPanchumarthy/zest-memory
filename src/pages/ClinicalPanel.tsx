import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import {
  Brain, TrendingDown, AlertTriangle, Activity, Loader2,
  CheckCircle2, BarChart3, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import PatientManagement from "@/components/clinical/PatientManagement";
import ClinicalAIPanel from "@/components/clinical/ClinicalAIPanel";

interface PatientData {
  patient_id: string;
  full_name: string;
  phone?: string | null;
  latestVitals: any | null;
  cogScore: number | null;
  cogTrend: { date: string; accuracy: number }[];
  unresolvedAlerts: number;
}

const ClinicalPanel = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allProfiles, setAllProfiles] = useState<{ user_id: string; full_name: string; phone?: string | null }[]>([]);
  const [allRoles, setAllRoles] = useState<{ user_id: string; role: string }[]>([]);
  const [assignments, setAssignments] = useState<{ id: string; patient_id: string; assigned_user_id: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: myAssignments } = await supabase
      .from("patient_assignments")
      .select("id, patient_id, assigned_user_id");

    setAssignments(myAssignments || []);
    const patientIds = [...new Set((myAssignments || []).map((a) => a.patient_id))];

    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    setAllProfiles(profilesRes.data || []);
    setAllRoles(rolesRes.data || []);

    if (patientIds.length === 0) { setLoading(false); return; }

    const [vitalsRes, alertsRes, gamesRes] = await Promise.all([
      supabase.from("patient_vitals").select("*").in("patient_id", patientIds).order("recorded_at", { ascending: false }).limit(100),
      supabase.from("emergency_alerts").select("*").in("patient_id", patientIds).order("created_at", { ascending: false }).limit(50),
      supabase.from("game_sessions").select("patient_id, accuracy, created_at").in("patient_id", patientIds).order("created_at", { ascending: true }).limit(200),
    ]);

    setAllAlerts(alertsRes.data || []);

    const profileMap: Record<string, { name: string; phone: string | null }> = {};
    (profilesRes.data || []).forEach((p) => { profileMap[p.user_id] = { name: p.full_name, phone: p.phone }; });

    const latestVitalsMap: Record<string, any> = {};
    (vitalsRes.data || []).forEach((v) => { if (!latestVitalsMap[v.patient_id]) latestVitalsMap[v.patient_id] = v; });

    const gamesByPatient: Record<string, { date: string; accuracy: number }[]> = {};
    (gamesRes.data || []).forEach((g) => {
      if (!gamesByPatient[g.patient_id]) gamesByPatient[g.patient_id] = [];
      gamesByPatient[g.patient_id].push({
        date: new Date(g.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        accuracy: Number(g.accuracy || 0),
      });
    });

    const alertsByPatient: Record<string, number> = {};
    (alertsRes.data || []).forEach((a) => {
      if (!a.is_resolved) alertsByPatient[a.patient_id] = (alertsByPatient[a.patient_id] || 0) + 1;
    });

    const patientData: PatientData[] = patientIds.map((id) => {
      const trends = gamesByPatient[id] || [];
      const latestScore = trends.length > 0 ? trends[trends.length - 1].accuracy : null;
      return {
        patient_id: id,
        full_name: profileMap[id]?.name || "Unknown",
        phone: profileMap[id]?.phone,
        latestVitals: latestVitalsMap[id] || null,
        cogScore: latestScore,
        cogTrend: trends,
        unresolvedAlerts: alertsByPatient[id] || 0,
      };
    });

    setPatients(patientData);
    setLoading(false);
  };

  const resolveAlert = async (alertId: string) => {
    await supabase.from("emergency_alerts").update({
      is_resolved: true, resolved_by: user?.id, resolved_at: new Date().toISOString(),
    }).eq("id", alertId);
    setAllAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_resolved: true } : a)));
  };

  const totalAlerts = allAlerts.filter((a) => !a.is_resolved).length;
  const avgScore = patients.length > 0
    ? Math.round(patients.filter((p) => p.cogScore != null).reduce((sum, p) => sum + (p.cogScore || 0), 0) / Math.max(patients.filter((p) => p.cogScore != null).length, 1))
    : null;
  const patientWithTrend = patients.find((p) => p.cogTrend.length > 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Clinical Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered patient management, analytics & risk assessment
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Patients", value: String(patients.length), icon: BarChart3, color: "text-primary" },
            { label: "Avg. Cognitive", value: avgScore != null ? avgScore + "%" : "—", icon: Brain, color: "text-[hsl(var(--lavender))]" },
            { label: "Active Alerts", value: String(totalAlerts), icon: AlertTriangle, color: totalAlerts > 0 ? "text-destructive" : "text-[hsl(var(--sage))]" },
            { label: "Assignments", value: String(assignments.length), icon: Activity, color: "text-[hsl(var(--sage))]" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="text-2xl font-serif text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Clinical Analysis */}
        {patients.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <ClinicalAIPanel patients={patients.map(p => ({ patient_id: p.patient_id, full_name: p.full_name }))} />
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cognitive Trend */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  Cognitive Score Trend
                  {patientWithTrend && (
                    <Badge variant="secondary" className="ml-2 text-xs">{patientWithTrend.full_name}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientWithTrend ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={patientWithTrend.cogTrend}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(200, 35%, 45%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(200, 35%, 45%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Area type="monotone" dataKey="accuracy" stroke="hsl(200, 35%, 45%)" strokeWidth={2.5} fill="url(#scoreGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-60 flex items-center justify-center text-muted-foreground">
                    <p>No cognitive data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Alerts */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[280px] overflow-y-auto">
                {allAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No alerts</p>
                ) : (
                  allAlerts.slice(0, 10).map((alert) => {
                    const pName = allProfiles.find((p) => p.user_id === alert.patient_id)?.full_name || "Unknown";
                    return (
                      <div
                        key={alert.id}
                        className={`flex flex-col sm:flex-row items-start gap-2 p-3 rounded-lg text-sm ${
                          alert.is_resolved ? "bg-muted/30 opacity-60" : alert.severity === "critical" ? "bg-[hsl(var(--coral-light))]" : "bg-[hsl(var(--warm-amber-light))]"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 mb-1">
                            <Badge variant="secondary" className="text-xs">{pName}</Badge>
                            <Badge variant="secondary" className="text-xs capitalize">{alert.alert_type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                        </div>
                        {!alert.is_resolved ? (
                          <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0" onClick={() => resolveAlert(alert.id)}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Resolve
                          </Button>
                        ) : (
                          <Badge className="bg-[hsl(var(--sage))]/10 text-[hsl(var(--sage))] text-xs shrink-0">Resolved</Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Patient Management */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <PatientManagement
            patients={patients}
            allProfiles={allProfiles}
            allRoles={allRoles}
            assignments={assignments}
            allAlerts={allAlerts}
            onReload={loadData}
            currentUserId={user?.id || ""}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default ClinicalPanel;
