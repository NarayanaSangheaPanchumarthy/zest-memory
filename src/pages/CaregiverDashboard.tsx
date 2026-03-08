import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import EmergencySOS from "@/components/EmergencySOS";
import {
  Bell, Activity, MapPin, MessageCircle, AlertTriangle,
  CheckCircle2, Brain, FileText, Eye, Users, Loader2, Pill
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import CareTaskManager from "@/components/caregiver/CareTaskManager";
import CommunicationLog from "@/components/caregiver/CommunicationLog";

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

const CaregiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [vitals, setVitals] = useState<Record<string, VitalRecord>>({});
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [cogScores, setCogScores] = useState<Record<string, number | null>>({});
  const [medications, setMedications] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const { data: assignments } = await supabase
      .from("patient_assignments")
      .select("patient_id")
      .eq("assigned_user_id", user.id);

    if (!assignments || assignments.length === 0) { setPatients([]); setLoading(false); return; }
    const patientIds = assignments.map((a) => a.patient_id);

    const [profilesRes, vitalsRes, alertsRes, gamesRes, medsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone").in("user_id", patientIds),
      supabase.from("patient_vitals").select("*").in("patient_id", patientIds).order("recorded_at", { ascending: false }).limit(50),
      supabase.from("emergency_alerts").select("*").in("patient_id", patientIds).order("created_at", { ascending: false }).limit(20),
      supabase.from("game_sessions").select("patient_id, accuracy, created_at").in("patient_id", patientIds).order("created_at", { ascending: false }).limit(50),
      supabase.from("medications").select("*").in("patient_id", patientIds).eq("is_active", true),
    ]);

    const profileMap: Record<string, { full_name: string; phone: string | null }> = {};
    profilesRes.data?.forEach((p) => { profileMap[p.user_id] = { full_name: p.full_name, phone: p.phone }; });
    setPatients(patientIds.map((id) => ({ patient_id: id, profile: profileMap[id] || null })));

    const latestVitals: Record<string, VitalRecord> = {};
    vitalsRes.data?.forEach((v) => { if (!latestVitals[v.patient_id]) latestVitals[v.patient_id] = v as VitalRecord; });
    setVitals(latestVitals);
    setAlerts((alertsRes.data || []) as AlertRecord[]);

    const latestScores: Record<string, number | null> = {};
    gamesRes.data?.forEach((g) => { if (!(g.patient_id in latestScores)) latestScores[g.patient_id] = g.accuracy; });
    setCogScores(latestScores);

    const medsMap: Record<string, any[]> = {};
    medsRes.data?.forEach((m) => { if (!medsMap[m.patient_id]) medsMap[m.patient_id] = []; medsMap[m.patient_id].push(m); });
    setMedications(medsMap);
    setLoading(false);
  };

  const resolveAlert = async (alertId: string) => {
    await supabase.from("emergency_alerts").update({ is_resolved: true, resolved_by: user?.id, resolved_at: new Date().toISOString() }).eq("id", alertId);
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_resolved: true } : a)));
  };

  const unresolvedAlerts = alerts.filter((a) => !a.is_resolved);
  const patientName = (id: string) => patients.find((p) => p.patient_id === id)?.profile?.full_name || "Unknown";
  const patientNames: Record<string, string> = {};
  patients.forEach(p => { patientNames[p.patient_id] = p.profile?.full_name || "Unknown"; });
  const profileNames: Record<string, string> = {};
  patients.forEach(p => { if (p.profile) profileNames[p.patient_id] = p.profile.full_name; });
  if (user) profileNames[user.id] = "You";

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
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Caregiver Dashboard</h1>
          <p className="text-muted-foreground">
            Managing {patients.length} patient{patients.length !== 1 ? "s" : ""}
          </p>
        </motion.div>

        {patients.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-lg font-serif text-foreground mb-1">No Patients Assigned</p>
              <p className="text-sm text-muted-foreground">A clinician needs to assign patients to you first.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Patients", value: String(patients.length), icon: Users, color: "text-primary" },
                { label: "Active Alerts", value: String(unresolvedAlerts.length), icon: AlertTriangle, color: unresolvedAlerts.length > 0 ? "text-destructive" : "text-[hsl(var(--sage))]" },
                { label: "With Vitals", value: String(Object.keys(vitals).length), icon: Activity, color: "text-[hsl(var(--lavender))]" },
                { label: "Avg Cognitive", value: Object.values(cogScores).length > 0 ? Math.round(Object.values(cogScores).reduce((a, b) => (a || 0) + (b || 0), 0)! / Object.values(cogScores).length) + "%" : "—", icon: Brain, color: "text-primary" },
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

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
                <TabsTrigger value="communication" className="text-xs sm:text-sm">Comms</TabsTrigger>
                <TabsTrigger value="alerts" className="text-xs sm:text-sm">Alerts ({unresolvedAlerts.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {patients.map((p) => {
                  const v = vitals[p.patient_id];
                  const score = cogScores[p.patient_id];
                  const meds = medications[p.patient_id] || [];
                  return (
                    <motion.div key={p.patient_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="shadow-card">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-semibold text-primary">{(p.profile?.full_name || "U").charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{p.profile?.full_name || "Unknown"}</p>
                                {p.profile?.phone && <p className="text-xs text-muted-foreground">{p.profile.phone}</p>}
                              </div>
                            </div>
                            {score != null && (
                              <Badge variant="secondary"><Brain className="w-3 h-3 mr-1" />{Math.round(score)}%</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            {[
                              { label: "Heart Rate", value: v?.pulse_rate || "—" },
                              { label: "Blood Pressure", value: v?.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : "—" },
                              { label: "Temperature", value: v?.temperature ? `${Number(v.temperature).toFixed(1)}°C` : "—" },
                              { label: "O₂ Sat", value: v?.oxygen_saturation ? `${Number(v.oxygen_saturation)}%` : "—" },
                            ].map((item) => (
                              <div key={item.label} className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="text-lg font-serif text-foreground">{item.value}</p>
                              </div>
                            ))}
                          </div>

                          {meds.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <Pill className="w-3 h-3" /> Current Medications
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {meds.map((m) => (
                                  <Badge key={m.id} variant="secondary" className="text-xs">
                                    {m.name} {m.dosage && `(${m.dosage})`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/vitals")}>
                              <Eye className="w-3 h-3 mr-1" /> Vitals
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/safety")}>
                              <MapPin className="w-3 h-3 mr-1" /> Location
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/documents")}>
                              <FileText className="w-3 h-3 mr-1" /> Docs
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <CareTaskManager userId={user!.id} patientNames={patientNames} />
              </TabsContent>

              <TabsContent value="communication" className="mt-4">
                <CommunicationLog
                  userId={user!.id}
                  patientIds={patients.map(p => p.patient_id)}
                  patientNames={patientNames}
                  profileNames={profileNames}
                />
              </TabsContent>

              <TabsContent value="alerts" className="mt-4">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bell className="w-5 h-5 text-destructive" />
                      Emergency Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {alerts.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">No alerts recorded</p>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${
                            alert.is_resolved ? "border-l-[hsl(var(--sage))] bg-[hsl(var(--sage-light))]/50 opacity-60"
                              : alert.severity === "critical" ? "border-l-destructive bg-[hsl(var(--coral-light))]"
                              : "border-l-[hsl(var(--warm-amber))] bg-[hsl(var(--warm-amber-light))]"
                          }`}
                        >
                          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">{patientName(alert.patient_id)}</Badge>
                              <Badge variant="secondary" className="text-xs capitalize">{alert.alert_type}</Badge>
                            </div>
                            <p className="text-sm text-foreground">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                          </div>
                          {!alert.is_resolved ? (
                            <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Resolve
                            </Button>
                          ) : (
                            <Badge className="bg-[hsl(var(--sage))]/10 text-[hsl(var(--sage))] text-xs">Resolved</Badge>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <EmergencySOS />
    </div>
  );
};

export default CaregiverDashboard;
