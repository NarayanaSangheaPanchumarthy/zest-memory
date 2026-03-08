import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import EmergencySOS from "@/components/EmergencySOS";
import {
  Bell, Pill, Activity, MapPin, MessageCircle,
  TrendingUp, AlertTriangle, CheckCircle2, Heart,
  Brain, FileText, Eye, Users, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AssignedPatient {
  patient_id: string;
  profile: { full_name: string; phone: string | null } | null;
}

interface VitalRecord {
  patient_id: string;
  temperature: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_rate: number | null;
  oxygen_saturation: number | null;
  recorded_at: string;
}

interface AlertRecord {
  id: string;
  patient_id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

interface GameRecord {
  patient_id: string;
  accuracy: number | null;
  created_at: string;
}

const CaregiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [vitals, setVitals] = useState<Record<string, VitalRecord>>({});
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [cogScores, setCogScores] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // 1. Get assigned patients
    const { data: assignments } = await supabase
      .from("patient_assignments")
      .select("patient_id")
      .eq("assigned_user_id", user.id);

    if (!assignments || assignments.length === 0) {
      setLoading(false);
      return;
    }

    const patientIds = assignments.map((a) => a.patient_id);

    // 2. Fetch profiles, latest vitals, alerts, and game sessions in parallel
    const [profilesRes, vitalsRes, alertsRes, gamesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone").in("user_id", patientIds),
      supabase.from("patient_vitals").select("*").in("patient_id", patientIds).order("recorded_at", { ascending: false }).limit(50),
      supabase.from("emergency_alerts").select("*").in("patient_id", patientIds).order("created_at", { ascending: false }).limit(20),
      supabase.from("game_sessions").select("patient_id, accuracy, created_at").in("patient_id", patientIds).order("created_at", { ascending: false }).limit(50),
    ]);

    // Map profiles
    const profileMap: Record<string, { full_name: string; phone: string | null }> = {};
    profilesRes.data?.forEach((p) => {
      profileMap[p.user_id] = { full_name: p.full_name, phone: p.phone };
    });

    const mappedPatients: AssignedPatient[] = patientIds.map((id) => ({
      patient_id: id,
      profile: profileMap[id] || null,
    }));
    setPatients(mappedPatients);

    // Latest vitals per patient
    const latestVitals: Record<string, VitalRecord> = {};
    vitalsRes.data?.forEach((v) => {
      if (!latestVitals[v.patient_id]) latestVitals[v.patient_id] = v as VitalRecord;
    });
    setVitals(latestVitals);

    // Alerts
    setAlerts((alertsRes.data || []) as AlertRecord[]);

    // Latest cognitive score per patient
    const latestScores: Record<string, number | null> = {};
    gamesRes.data?.forEach((g) => {
      if (!(g.patient_id in latestScores)) latestScores[g.patient_id] = g.accuracy;
    });
    setCogScores(latestScores);

    setLoading(false);
  };

  const resolveAlert = async (alertId: string) => {
    await supabase.from("emergency_alerts").update({ is_resolved: true, resolved_by: user?.id, resolved_at: new Date().toISOString() }).eq("id", alertId);
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_resolved: true } : a)));
  };

  const unresolvedAlerts = alerts.filter((a) => !a.is_resolved);
  const patientName = (id: string) => patients.find((p) => p.patient_id === id)?.profile?.full_name || "Unknown";

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-heading text-foreground">Caregiver Dashboard</h1>
          <p className="text-accessible text-muted-foreground">
            Monitoring {patients.length} assigned patient{patients.length !== 1 ? "s" : ""}
          </p>
        </motion.div>

        {patients.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No patients assigned yet.</p>
              <p className="text-sm text-muted-foreground mt-1">A clinician needs to assign patients to you.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Assigned Patients", value: String(patients.length), icon: Users, color: "text-primary" },
                { label: "Active Alerts", value: String(unresolvedAlerts.length), icon: AlertTriangle, color: unresolvedAlerts.length > 0 ? "text-coral" : "text-sage" },
                { label: "Patients with Vitals", value: String(Object.keys(vitals).length), icon: Activity, color: "text-lavender" },
                { label: "Avg. Cognitive Score", value: Object.values(cogScores).length > 0 ? Math.round(Object.values(cogScores).reduce((a, b) => (a || 0) + (b || 0), 0)! / Object.values(cogScores).length).toString() + "%" : "—", icon: Brain, color: "text-primary" },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="shadow-card">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <p className="text-2xl font-serif text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Alerts */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-title">
                      <Bell className="w-5 h-5 text-primary" />
                      Recent Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {alerts.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No alerts from assigned patients</p>
                    ) : (
                      alerts.slice(0, 8).map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${
                            alert.is_resolved
                              ? "border-l-sage bg-sage-light/50 opacity-60"
                              : alert.severity === "critical"
                              ? "border-l-destructive bg-coral-light"
                              : "border-l-amber bg-amber-light"
                          }`}
                        >
                          {alert.alert_type === "sos" ? (
                            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-destructive" />
                          ) : (
                            <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">{patientName(alert.patient_id)}</Badge>
                              <Badge variant="secondary" className="text-xs capitalize">{alert.alert_type}</Badge>
                            </div>
                            <p className="text-sm text-foreground">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                          </div>
                          {!alert.is_resolved && (
                            <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Resolve
                            </Button>
                          )}
                          {alert.is_resolved && (
                            <Badge className="bg-sage/10 text-sage text-xs">Resolved</Badge>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Patient List */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-title">
                      <Heart className="w-5 h-5 text-coral" />
                      My Patients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {patients.map((p) => {
                      const v = vitals[p.patient_id];
                      const score = cogScores[p.patient_id];
                      return (
                        <div key={p.patient_id} className="p-3 rounded-xl bg-muted/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">{p.profile?.full_name || "Unknown"}</p>
                            {score != null && (
                              <Badge variant="secondary" className="text-xs">
                                <Brain className="w-3 h-3 mr-1" />{Math.round(score)}%
                              </Badge>
                            )}
                          </div>
                          {v ? (
                            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                              {v.pulse_rate && <span>❤️ {v.pulse_rate} bpm</span>}
                              {v.blood_pressure_systolic && <span>🩸 {v.blood_pressure_systolic}/{v.blood_pressure_diastolic}</span>}
                              {v.temperature && <span>🌡️ {Number(v.temperature).toFixed(1)}°C</span>}
                              {v.oxygen_saturation && <span>💨 {Number(v.oxygen_saturation)}% O₂</span>}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No vitals recorded</p>
                          )}
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => navigate("/vitals")}>
                              <Eye className="w-3 h-3 mr-1" /> Vitals
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => navigate("/safety")}>
                              <MapPin className="w-3 h-3 mr-1" /> Location
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => navigate("/documents")}>
                              <FileText className="w-3 h-3 mr-1" /> Docs
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-title">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-4 gap-3">
                  {[
                    { label: "View Vitals", icon: Activity, path: "/vitals", color: "bg-calm-light text-calm" },
                    { label: "AI Chat", icon: MessageCircle, path: "/chat", color: "bg-sage-light text-sage" },
                    { label: "Documents", icon: FileText, path: "/documents", color: "bg-amber-light text-amber" },
                    { label: "Notifications", icon: Bell, path: "/notifications", color: "bg-lavender-light text-lavender" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity cursor-pointer`}
                    >
                      <action.icon className="w-7 h-7" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </main>
      <EmergencySOS />
    </div>
  );
};

export default CaregiverDashboard;