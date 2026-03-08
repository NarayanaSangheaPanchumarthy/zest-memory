import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import {
  Brain, TrendingDown, Users, FileText, Download,
  AlertTriangle, Activity, BarChart3, UserPlus, Loader2,
  CheckCircle2, Eye, MapPin, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PatientData {
  patient_id: string;
  full_name: string;
  latestVitals: any | null;
  cogScore: number | null;
  cogTrend: { date: string; accuracy: number }[];
  unresolvedAlerts: number;
}

const ClinicalPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [allProfiles, setAllProfiles] = useState<{ user_id: string; full_name: string }[]>([]);
  const [allRoles, setAllRoles] = useState<{ user_id: string; role: string }[]>([]);
  const [assignments, setAssignments] = useState<{ id: string; patient_id: string; assigned_user_id: string }[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedCaregiver, setSelectedCaregiver] = useState("");

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Get all assignments for this clinician
    const { data: myAssignments } = await supabase
      .from("patient_assignments")
      .select("id, patient_id, assigned_user_id");

    setAssignments(myAssignments || []);

    const patientIds = [...new Set((myAssignments || []).map((a) => a.patient_id))];

    // Load all profiles and roles for assignment management
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    setAllProfiles(profilesRes.data || []);
    setAllRoles(rolesRes.data || []);

    if (patientIds.length === 0) {
      setLoading(false);
      return;
    }

    // Load patient data
    const [vitalsRes, alertsRes, gamesRes] = await Promise.all([
      supabase.from("patient_vitals").select("*").in("patient_id", patientIds).order("recorded_at", { ascending: false }).limit(100),
      supabase.from("emergency_alerts").select("*").in("patient_id", patientIds).order("created_at", { ascending: false }).limit(50),
      supabase.from("game_sessions").select("patient_id, accuracy, created_at").in("patient_id", patientIds).order("created_at", { ascending: true }).limit(200),
    ]);

    setAllAlerts(alertsRes.data || []);

    // Build patient data
    const profileMap: Record<string, string> = {};
    (profilesRes.data || []).forEach((p) => { profileMap[p.user_id] = p.full_name; });

    const latestVitalsMap: Record<string, any> = {};
    (vitalsRes.data || []).forEach((v) => {
      if (!latestVitalsMap[v.patient_id]) latestVitalsMap[v.patient_id] = v;
    });

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
        full_name: profileMap[id] || "Unknown",
        latestVitals: latestVitalsMap[id] || null,
        cogScore: latestScore,
        cogTrend: trends,
        unresolvedAlerts: alertsByPatient[id] || 0,
      };
    });

    setPatients(patientData);
    setLoading(false);
  };

  const handleAssign = async () => {
    if (!selectedPatient || !selectedCaregiver) {
      toast.error("Please select both a patient and a caregiver/clinician");
      return;
    }
    const { error } = await supabase.from("patient_assignments").insert({
      patient_id: selectedPatient,
      assigned_user_id: selectedCaregiver,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Assignment created!");
    setAssignDialogOpen(false);
    setSelectedPatient("");
    setSelectedCaregiver("");
    loadData();
  };

  const removeAssignment = async (id: string) => {
    const { error } = await supabase.from("patient_assignments").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Assignment removed");
    loadData();
  };

  const resolveAlert = async (alertId: string) => {
    await supabase.from("emergency_alerts").update({ is_resolved: true, resolved_by: user?.id, resolved_at: new Date().toISOString() }).eq("id", alertId);
    setAllAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_resolved: true } : a)));
  };

  const patientProfiles = allProfiles.filter((p) =>
    allRoles.some((r) => r.user_id === p.user_id && r.role === "patient")
  );
  const caregiverProfiles = allProfiles.filter((p) =>
    allRoles.some((r) => r.user_id === p.user_id && (r.role === "caregiver" || r.role === "clinician"))
  );

  const totalAlerts = allAlerts.filter((a) => !a.is_resolved).length;
  const avgScore = patients.length > 0
    ? Math.round(patients.filter((p) => p.cogScore != null).reduce((sum, p) => sum + (p.cogScore || 0), 0) / Math.max(patients.filter((p) => p.cogScore != null).length, 1))
    : null;

  // Aggregate cognitive trend for chart (first patient with data)
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-heading text-foreground">Clinical Insights</h1>
            <p className="text-accessible text-muted-foreground">
              Patient management, analytics & risk assessment
            </p>
          </div>
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Assign Caregiver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Caregiver to Patient</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger><SelectValue placeholder="Select a patient" /></SelectTrigger>
                    <SelectContent>
                      {patientProfiles.map((p) => (
                        <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.user_id.slice(0, 8)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Caregiver / Clinician</Label>
                  <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                    <SelectTrigger><SelectValue placeholder="Select a caregiver" /></SelectTrigger>
                    <SelectContent>
                      {caregiverProfiles.map((p) => (
                        <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.user_id.slice(0, 8)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssign} className="w-full">Create Assignment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Patients", value: String(patients.length), icon: Users, color: "text-primary" },
            { label: "Avg. Cognitive Score", value: avgScore != null ? avgScore + "%" : "—", icon: Brain, color: "text-lavender" },
            { label: "Active Alerts", value: String(totalAlerts), icon: AlertTriangle, color: totalAlerts > 0 ? "text-coral" : "text-sage" },
            { label: "Assignments", value: String(assignments.length), icon: Activity, color: "text-sage" },
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cognitive Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-title">
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
                <CardTitle className="flex items-center gap-2 text-title">
                  <AlertTriangle className="w-5 h-5 text-coral" />
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
                        className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                          alert.is_resolved ? "bg-muted/30 opacity-60" : alert.severity === "critical" ? "bg-coral-light" : "bg-amber-light"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            <Badge variant="secondary" className="text-xs">{pName}</Badge>
                            <Badge variant="secondary" className="text-xs capitalize">{alert.alert_type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                        </div>
                        {!alert.is_resolved ? (
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => resolveAlert(alert.id)}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Resolve
                          </Button>
                        ) : (
                          <Badge className="bg-sage/10 text-sage text-xs shrink-0">Resolved</Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Patient Registry */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-title">
                <Users className="w-5 h-5 text-primary" />
                Patient Registry
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No patients assigned yet. Use "Assign Caregiver" to create assignments.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Patient</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Cognitive Score</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Latest Vitals</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Alerts</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p) => (
                        <tr key={p.patient_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-4 font-medium text-foreground">{p.full_name}</td>
                          <td className="py-4">
                            {p.cogScore != null ? (
                              <span className="font-serif text-lg text-foreground">{Math.round(p.cogScore)}%</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </td>
                          <td className="py-4">
                            {p.latestVitals ? (
                              <div className="text-xs text-muted-foreground space-x-2">
                                {p.latestVitals.pulse_rate && <span>❤️ {p.latestVitals.pulse_rate}</span>}
                                {p.latestVitals.blood_pressure_systolic && (
                                  <span>🩸 {p.latestVitals.blood_pressure_systolic}/{p.latestVitals.blood_pressure_diastolic}</span>
                                )}
                                {p.latestVitals.oxygen_saturation && <span>💨 {Number(p.latestVitals.oxygen_saturation)}%</span>}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No data</span>
                            )}
                          </td>
                          <td className="py-4">
                            {p.unresolvedAlerts > 0 ? (
                              <Badge className="bg-coral-light text-coral">{p.unresolvedAlerts} active</Badge>
                            ) : (
                              <Badge className="bg-sage-light text-sage">Clear</Badge>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate("/vitals")}>
                                <Eye className="w-3 h-3 mr-1" /> Vitals
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate("/documents")}>
                                <FileText className="w-3 h-3 mr-1" /> Docs
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Assignment Management */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-title">
                <UserPlus className="w-5 h-5 text-sage" />
                Current Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No assignments yet</p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((a) => {
                    const patientName = allProfiles.find((p) => p.user_id === a.patient_id)?.full_name || a.patient_id.slice(0, 8);
                    const caregiverName = allProfiles.find((p) => p.user_id === a.assigned_user_id)?.full_name || a.assigned_user_id.slice(0, 8);
                    const caregiverRole = allRoles.find((r) => r.user_id === a.assigned_user_id)?.role || "unknown";
                    return (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{patientName}</p>
                            <p className="text-xs text-muted-foreground">Patient</p>
                          </div>
                          <span className="text-muted-foreground">→</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{caregiverName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{caregiverRole}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeAssignment(a.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ClinicalPanel;